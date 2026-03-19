package storage

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/syednasir/ai-incident-manager/pkg/models"
)

// GetTimelineEvents returns timeline events for an incident.
func GetTimelineEvents(ctx context.Context, db *pgxpool.Pool, incidentID int) ([]models.TimelineEvent, error) {
	const query = `
		SELECT timestamp, source, message
		FROM timeline_events
		WHERE incident_id = $1
		ORDER BY timestamp ASC
	`

	rows, err := db.Query(ctx, query, incidentID)
	if err != nil {
		return nil, fmt.Errorf("query timeline events: %w", err)
	}
	defer rows.Close()

	var events []models.TimelineEvent
	for rows.Next() {
		var ev models.TimelineEvent
		if err := rows.Scan(&ev.Timestamp, &ev.Source, &ev.Message); err != nil {
			return nil, fmt.Errorf("scan timeline event: %w", err)
		}
		events = append(events, ev)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate timeline events: %w", err)
	}

	return events, nil
}

