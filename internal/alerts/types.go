package alerts

import (
	"fmt"
	"time"
)

// AlertManagerWebhook represents the root structure of a Prometheus
// Alertmanager webhook payload.
type AlertManagerWebhook struct {
	Alerts []Alert `json:"alerts"`
}

// Alert represents a single alert within an Alertmanager webhook payload.
type Alert struct {
	Labels   AlertLabels `json:"labels"`
	StartsAt time.Time   `json:"startsAt"`
	Status   string      `json:"status"`
}

// AlertLabels contains the subset of labels we care about for incidents.
type AlertLabels struct {
	Service  string `json:"service"`
	Severity string `json:"severity"`
}

// All returns all labels as a map for logging purposes
func (al AlertLabels) All() map[string]string {
	return map[string]string{
		"service":  al.Service,
		"severity": al.Severity,
	}
}

// String returns a string representation of the labels
func (al AlertLabels) String() string {
	return fmt.Sprintf("service=%s, severity=%s", al.Service, al.Severity)
}
