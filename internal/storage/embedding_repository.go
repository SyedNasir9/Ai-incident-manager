package storage

import (
	"context"
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

// validateEmbedding validates the embedding data before storage
func validateEmbedding(embedding *models.IncidentEmbedding) error {
	if embedding == nil {
		return fmt.Errorf("embedding is nil")
	}

	if embedding.ID == "" {
		return fmt.Errorf("embedding ID cannot be empty")
	}

	if embedding.IncidentID <= 0 {
		return fmt.Errorf("incident ID must be positive")
	}

	if len(embedding.Embedding) == 0 {
		return fmt.Errorf("embedding vector cannot be empty")
	}

	// Check for standard embedding size (1536 for OpenAI ada-002)
	expectedSize := 1536
	if len(embedding.Embedding) != expectedSize {
		return fmt.Errorf("embedding vector size mismatch: expected %d, got %d", expectedSize, len(embedding.Embedding))
	}

	// Check for valid values (no NaN or Inf)
	for i, val := range embedding.Embedding {
		if val != val { // NaN check
			return fmt.Errorf("embedding contains NaN at index %d", i)
		}
		if val == 0 && (1/val) == 0 { // Inf check
			return fmt.Errorf("embedding contains infinity at index %d", i)
		}
	}

	return nil
}

// SaveEmbedding inserts a new incident embedding into the incident_embeddings table.
// The embedding slice is stored as a pgvector array using pgx native parameter binding.
func (r *EmbeddingRepository) SaveEmbedding(ctx context.Context, embedding *models.IncidentEmbedding) error {
	// Validate embedding before storage
	if err := validateEmbedding(embedding); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}

	const query = `
		INSERT INTO incident_embeddings (id, incident_id, embedding, created_at)
		VALUES ($1, $2, $3, COALESCE($4, NOW()))
		ON CONFLICT (incident_id) 
		DO UPDATE SET 
			embedding = EXCLUDED.embedding,
			created_at = EXCLUDED.created_at
	`

	createdAt := embedding.CreatedAt
	if createdAt.IsZero() {
		createdAt = time.Now()
	}

	_, err := r.DB.Exec(ctx, query,
		embedding.ID,
		embedding.IncidentID,
		embedding.Embedding, // pgx will handle []float64 to pgvector conversion
		createdAt,
	)
	if err != nil {
		return fmt.Errorf("insert embedding: %w", err)
	}

	return nil
}

// GetAllEmbeddings returns all incident embeddings from the incident_embeddings table.
// Uses pgx native parameter binding for efficient vector retrieval.
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
			incidentID int
			embedding  []float64 // pgx will scan pgvector directly to []float64
			createdAt  time.Time
		)

		if err := rows.Scan(&id, &incidentID, &embedding, &createdAt); err != nil {
			return nil, fmt.Errorf("scan embedding row: %w", err)
		}

		result = append(result, models.IncidentEmbedding{
			ID:         id,
			IncidentID: incidentID,
			Embedding:  embedding,
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
func (r *EmbeddingRepository) GetEmbeddingByIncidentID(ctx context.Context, incidentID int) (*models.IncidentEmbedding, error) {
	const query = `
		SELECT id, incident_id, embedding, created_at
		FROM incident_embeddings
		WHERE incident_id = $1
		LIMIT 1
	`

	row := r.DB.QueryRow(ctx, query, incidentID)

	var (
		embID        string
		dbIncidentID int
		embedding    []float64 // pgx will scan pgvector directly to []float64
		createdAt    time.Time
	)

	if err := row.Scan(&embID, &dbIncidentID, &embedding, &createdAt); err != nil {
		// Use pgx's standard no-rows error to signal absence.
		if err.Error() == "no rows in result set" {
			return nil, nil
		}
		return nil, fmt.Errorf("scan embedding by incident id: %w", err)
	}

	return &models.IncidentEmbedding{
		ID:         embID,
		IncidentID: dbIncidentID,
		Embedding:  embedding,
		CreatedAt:  createdAt,
	}, nil
}
