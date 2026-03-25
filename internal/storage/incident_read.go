package storage

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/syednasir/ai-incident-manager/pkg/models"
)

// GetIncidentStatus returns the status string for an incident.
func GetIncidentStatus(ctx context.Context, db *pgxpool.Pool, incidentID int) (string, error) {
	const query = `
		SELECT status
		FROM incidents
		WHERE id = $1
	`

	var status string
	err := db.QueryRow(ctx, query, incidentID).Scan(&status)
	if err != nil {
		if err == pgx.ErrNoRows {
			return "", nil
		}
		return "", fmt.Errorf("query incident status: %w", err)
	}

	return status, nil
}

// GetIncidentByID returns the incident row, or (nil, nil) if not found.
func GetIncidentByID(ctx context.Context, db *pgxpool.Pool, id int) (*models.Incident, error) {
	const query = `
		SELECT id, service, severity, start_time, status
		FROM incidents
		WHERE id = $1
	`

	var inc models.Incident
	err := db.QueryRow(ctx, query, id).Scan(
		&inc.ID,
		&inc.Service,
		&inc.Severity,
		&inc.StartTime,
		&inc.Status,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("query incident by id: %w", err)
	}

	return &inc, nil
}
