package models

import "time"

type Incident struct {
	ID        int       `json:"id"`
	Service   string    `json:"service"`
	Severity  string    `json:"severity"`
	StartTime time.Time `json:"start_time"`
	Status    string    `json:"status"`
}
