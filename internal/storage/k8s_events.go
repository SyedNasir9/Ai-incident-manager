package storage

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/syednasir/ai-incident-manager/internal/observability"
)

// SaveKubernetesEvents stores Kubernetes-related events for an incident
// in the incident_k8s_events table.
//
// Expected columns:
//   incident_id, timestamp, reason, message
func SaveKubernetesEvents(ctx context.Context, db *pgxpool.Pool, incidentID int, events []observability.KubeEvent) error {
	if len(events) == 0 {
		return nil
	}

	const query = `
		INSERT INTO incident_k8s_events (incident_id, timestamp, reason, message)
		VALUES ($1, $2, $3, $4);
	`

	for _, e := range events {
		if _, err := db.Exec(ctx, query, incidentID, e.Timestamp, e.Reason, e.Message); err != nil {
			return err
		}
	}

	return nil
}

