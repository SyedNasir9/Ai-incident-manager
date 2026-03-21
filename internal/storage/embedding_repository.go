package storage

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/syednasir/ai-incident-manager/pkg/models"
)

type EmbeddingRepository struct {
	DB *pgxpool.Pool
}

func NewEmbeddingRepository(db *pgxpool.Pool) *EmbeddingRepository {
	return &EmbeddingRepository{DB: db}
}

// SaveEmbedding inserts a new incident embedding into the incident_embeddings table.
// The embedding slice is serialized as JSONB.
func (r *EmbeddingRepository) SaveEmbedding(ctx context.Context, embedding *models.IncidentEmbedding) error {
	if embedding == nil {
		return fmt.Errorf("embedding is nil")
	}

	vecJSON, err := json.Marshal(embedding.Embedding)
	if err != nil {
		return fmt.Errorf("marshal embedding: %w", err)
	}

	const query = `
		INSERT INTO incident_embeddings (id, incident_id, embedding, created_at)
		VALUES ($1, $2, $3, COALESCE($4, NOW()))
	`

	createdAt := embedding.CreatedAt
	if createdAt.IsZero() {
		createdAt = time.Now()
	}

	_, err = r.DB.Exec(ctx, query,
		embedding.ID,
		embedding.IncidentID,
		vecJSON,
		createdAt,
	)
	if err != nil {
		return fmt.Errorf("insert embedding: %w", err)
	}

	return nil
}

// GetAllEmbeddings returns all incident embeddings from the incident_embeddings table.
// The embedding JSONB column is deserialized into []float64.
func (r *EmbeddingRepository) GetAllEmbeddings(ctx context.Context) ([]models.IncidentEmbedding, error) {
	const query = `
		SELECT id, incident_id, embedding, created_at
		FROM incident_embeddings
		ORDER BY created_at ASC
	`

	rows, err := r.DB.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query embeddings: %w", err)
	}
	defer rows.Close()

	var result []models.IncidentEmbedding

	for rows.Next() {
		var (
			id         string
			incidentID string
			embeddingJSON []byte
			createdAt  time.Time
		)

		if err := rows.Scan(&id, &incidentID, &embeddingJSON, &createdAt); err != nil {
			return nil, fmt.Errorf("scan embedding row: %w", err)
		}

		var vec []float64
		if err := json.Unmarshal(embeddingJSON, &vec); err != nil {
			return nil, fmt.Errorf("unmarshal embedding json: %w", err)
		}

		result = append(result, models.IncidentEmbedding{
			ID:         id,
			IncidentID: incidentID,
			Embedding:  vec,
			CreatedAt:  createdAt,
		})
	}

	if rows.Err() != nil {
		return nil, fmt.Errorf("iterate embeddings: %w", rows.Err())
	}

	return result, nil
}

// GetEmbeddingByIncidentID returns a single embedding for the given incident ID,
// or nil,nil if no embedding exists.
func (r *EmbeddingRepository) GetEmbeddingByIncidentID(ctx context.Context, incidentID string) (*models.IncidentEmbedding, error) {
	const query = `
		SELECT id, incident_id, embedding, created_at
		FROM incident_embeddings
		WHERE incident_id = $1
		LIMIT 1
	`

	row := r.DB.QueryRow(ctx, query, incidentID)

	var (
		id        string
		embJSON   []byte
		createdAt time.Time
	)

	if err := row.Scan(&id, &incidentID, &embJSON, &createdAt); err != nil {
		// Use pgx's standard no-rows error to signal absence.
		if err.Error() == "no rows in result set" {
			return nil, nil
		}
		return nil, fmt.Errorf("scan embedding by incident id: %w", err)
	}

	var vec []float64
	if err := json.Unmarshal(embJSON, &vec); err != nil {
		return nil, fmt.Errorf("unmarshal embedding json: %w", err)
	}

	return &models.IncidentEmbedding{
		ID:         id,
		IncidentID: incidentID,
		Embedding:  vec,
		CreatedAt:  createdAt,
	}, nil
}


