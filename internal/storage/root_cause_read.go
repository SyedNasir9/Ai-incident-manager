package storage

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// GetLatestRootCause returns the most recent root-cause text for an incident.
// It returns ("", nil) if no root cause exists.
func GetLatestRootCause(ctx context.Context, db *pgxpool.Pool, incidentID int) (string, error) {
	const query = `
		SELECT root_cause
		FROM incident_root_causes
		WHERE incident_id = $1
		ORDER BY created_at DESC
		LIMIT 1
	`

	var rootCause string
	err := db.QueryRow(ctx, query, incidentID).Scan(&rootCause)
	if err != nil {
		if err == pgx.ErrNoRows {
			return "", nil
		}
		return "", fmt.Errorf("query root cause: %w", err)
	}

	return rootCause, nil
}

