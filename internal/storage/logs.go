package storage

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/syednasir/ai-incident-manager/internal/observability"
)

// SaveLogs stores Loki-derived log entries for a given incident in the
// incident_logs table.
//
// Expected columns:
//   incident_id, timestamp, message
func SaveLogs(ctx context.Context, db *pgxpool.Pool, incidentID int, logs []observability.LogEntry) error {
	if len(logs) == 0 {
		return nil
	}

	const query = `
		INSERT INTO incident_logs (incident_id, timestamp, message)
		VALUES ($1, $2, $3);
	`

	for _, l := range logs {
		if _, err := db.Exec(ctx, query, incidentID, l.Timestamp, l.Message); err != nil {
			return err
		}
	}

	return nil
}

