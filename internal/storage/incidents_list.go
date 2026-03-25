package storage

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/syednasir/ai-incident-manager/pkg/models"
)

// ListIncidents returns incidents ordered by start_time descending.
func ListIncidents(ctx context.Context, db *pgxpool.Pool, limit, offset int) ([]models.Incident, error) {
	const query = `
		SELECT id, service, severity, start_time, status
		FROM incidents
		ORDER BY start_time DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("list incidents: %w", err)
	}
	defer rows.Close()

	var out []models.Incident
	for rows.Next() {
		var inc models.Incident
		if err := rows.Scan(&inc.ID, &inc.Service, &inc.Severity, &inc.StartTime, &inc.Status); err != nil {
			return nil, fmt.Errorf("scan incident: %w", err)
		}
		out = append(out, inc)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate incidents: %w", err)
	}

	return out, nil
}

// CountIncidents returns the total number of rows in incidents.
func CountIncidents(ctx context.Context, db *pgxpool.Pool) (int64, error) {
	const query = `SELECT COUNT(*) FROM incidents`

	var n int64
	if err := db.QueryRow(ctx, query).Scan(&n); err != nil {
		return 0, fmt.Errorf("count incidents: %w", err)
	}
	return n, nil
}
