package timeline

import (
	"fmt"
	"sort"

	"github.com/syednasir/ai-incident-manager/internal/observability"
	"github.com/syednasir/ai-incident-manager/pkg/models"
)

// BuildTimeline converts aggregated incident signals into a flat,
// time-ordered slice of TimelineEvent entries.
func BuildTimeline(signals observability.IncidentSignals) []models.TimelineEvent {
	var events []models.TimelineEvent

	// 1. Metrics -> timeline events.
	for _, pt := range signals.Metrics.CPUUsage {
		events = append(events, models.TimelineEvent{
			Timestamp: pt.Timestamp,
			Source:    "metrics",
			Message:   fmt.Sprintf("CPU usage spike: %.0f%%", pt.Value),
		})
	}
	for _, pt := range signals.Metrics.MemoryUsage {
		events = append(events, models.TimelineEvent{
			Timestamp: pt.Timestamp,
			Source:    "metrics",
			Message:   fmt.Sprintf("Memory usage spike: %.0f%%", pt.Value),
		})
	}
	for _, pt := range signals.Metrics.ErrorRate {
		events = append(events, models.TimelineEvent{
			Timestamp: pt.Timestamp,
			Source:    "metrics",
			Message:   fmt.Sprintf("Error rate increase: %.0f%%", pt.Value),
		})
	}

	// 2. Logs -> timeline events.
	for _, l := range signals.Logs {
		events = append(events, models.TimelineEvent{
			Timestamp: l.Timestamp,
			Source:    "logs",
			Message:   l.Message,
		})
	}

	// 3. Kubernetes events -> timeline events.
	for _, e := range signals.K8sEvents {
		events = append(events, models.TimelineEvent{
			Timestamp: e.Timestamp,
			Source:    "kubernetes",
			Message:   e.Reason + " - " + e.Message,
		})
	}
	for _, d := range signals.Deployments {
		events = append(events, models.TimelineEvent{
			Timestamp: d.Timestamp,
			Source:    "deployment",
			Message:   d.Reason + ": " + d.Message,
		})
	}

	// 4. GitHub commits -> timeline events.
	for _, c := range signals.Commits {
		events = append(events, models.TimelineEvent{
			Timestamp: c.Timestamp,
			Source:    "github",
			Message:   "commit: " + c.Message + " by " + c.Author,
		})
	}

	// 5. Merged pull requests -> timeline events.
	for _, pr := range signals.MergedPRs {
		events = append(events, models.TimelineEvent{
			Timestamp: pr.MergedAt,
			Source:    "deployment",
			Message:   "PR #" + itoa(pr.Number) + " merged: " + pr.Title,
		})
	}

	// Sort all events by timestamp for a coherent timeline.
	sort.Slice(events, func(i, j int) bool {
		return events[i].Timestamp.Before(events[j].Timestamp)
	})

	return events
}

// itoa is a tiny helper to avoid pulling in strconv directly here.
func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	var buf [20]byte
	i := len(buf)
	neg := n < 0
	if neg {
		n = -n
	}
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}
