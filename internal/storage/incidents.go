package storage

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/syednasir/ai-incident-manager/pkg/models"
)

// CreateIncident inserts a new incident into the incidents table and
// returns the newly created incident ID.
func CreateIncident(ctx context.Context, db *pgxpool.Pool, incident models.Incident) (int, error) {
	const query = `
		INSERT INTO incidents (service, severity, start_time, status)
		VALUES ($1, $2, $3, $4)
		RETURNING id;
	`

	var id int
	err := db.QueryRow(ctx, query,
		incident.Service,
		incident.Severity,
		incident.StartTime,
		incident.Status,
	).Scan(&id)
	if err != nil {
		return 0, err
	}

	return id, nil
}

