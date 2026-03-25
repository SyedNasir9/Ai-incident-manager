package storage

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// SaveRootCause stores an AI-generated root cause summary for an incident.
//
// Expected columns:
//
//	incident_id, root_cause
func SaveRootCause(ctx context.Context, db *pgxpool.Pool, incidentID int, rootCause string) error {
	const query = `
		INSERT INTO incident_root_causes (incident_id, root_cause)
		VALUES ($1, $2);
	`

	_, err := db.Exec(ctx, query, incidentID, rootCause)
	return err
}
