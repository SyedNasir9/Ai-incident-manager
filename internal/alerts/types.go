package alerts

import "time"

// AlertManagerWebhook represents the root structure of a Prometheus
// Alertmanager webhook payload.
type AlertManagerWebhook struct {
	Alerts []Alert `json:"alerts"`
}

// Alert represents a single alert within an Alertmanager webhook payload.
type Alert struct {
	Labels   AlertLabels `json:"labels"`
	StartsAt time.Time   `json:"startsAt"`
}

// AlertLabels contains the subset of labels we care about for incidents.
type AlertLabels struct {
	Service  string `json:"service"`
	Severity string `json:"severity"`
}

