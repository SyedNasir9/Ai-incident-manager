package storage

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/syednasir/ai-incident-manager/internal/observability"
)

// SaveMetrics persists CPU, memory, and error-rate metrics associated with
// a specific incident into the incident_metrics table.
//
// Expected columns:
//   incident_id, metric_type, value, timestamp
func SaveMetrics(ctx context.Context, db *pgxpool.Pool, incidentID int, metrics observability.Metrics) error {
	const query = `
		INSERT INTO incident_metrics (incident_id, metric_type, value, timestamp)
		VALUES ($1, $2, $3, $4);
	`

	// Helper to insert a slice of MetricPoint with the given metricType label.
	insertPoints := func(metricType string, points []observability.MetricPoint) error {
		for _, pt := range points {
			if _, err := db.Exec(ctx, query, incidentID, metricType, pt.Value, pt.Timestamp); err != nil {
				return err
			}
		}
		return nil
	}

	if err := insertPoints("cpu_usage", metrics.CPUUsage); err != nil {
		return err
	}
	if err := insertPoints("memory_usage", metrics.MemoryUsage); err != nil {
		return err
	}
	if err := insertPoints("error_rate", metrics.ErrorRate); err != nil {
		return err
	}

	return nil
}

