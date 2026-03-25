package storage

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/syednasir/ai-incident-manager/pkg/models"
)

// SaveTimeline inserts all timeline events for a given incident into the
// timeline_events table.
//
// Expected table schema (conceptual):
//
//	timeline_events(incident_id, timestamp, source, message)
func SaveTimeline(ctx context.Context, db *pgxpool.Pool, incidentID int, events []models.TimelineEvent) error {
	if len(events) == 0 {
		return nil
	}

	const query = `
		INSERT INTO timeline_events (incident_id, timestamp, source, message)
		VALUES ($1, $2, $3, $4);
	`

	for _, e := range events {
		if _, err := db.Exec(ctx, query, incidentID, e.Timestamp, e.Source, e.Message); err != nil {
			return err
		}
	}

	return nil
}
