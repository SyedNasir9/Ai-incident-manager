package models

import "time"

type IncidentEmbedding struct {
	ID         string    `json:"id" db:"id"`
	IncidentID string    `json:"incident_id" db:"incident_id"`
	Embedding  []float64 `json:"embedding" db:"embedding"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

type SimilarIncident struct {
	IncidentID string  `json:"incident_id" db:"incident_id"`
	Score      float64 `json:"score" db:"score"`
}


