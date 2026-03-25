package models

import "time"

type TimelineEvent struct {
	Timestamp time.Time `json:"timestamp"`
	Source    string    `json:"source"`
	Message   string    `json:"message"`
	// IncidentID is used for cross-linking timeline events to Grafana annotations.
	// It is not required for timeline rendering in the UI.
	IncidentID int `json:"incident_id,omitempty"`
}
