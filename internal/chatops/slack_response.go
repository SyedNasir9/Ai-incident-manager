package chatops

import (
	"fmt"
	"sort"
	"strings"

	"github.com/syednasir/ai-incident-manager/pkg/models"
)

func FormatTimeline(events []models.TimelineEvent) string {
	if len(events) == 0 {
		return "Incident Timeline\n\n(no events)"
	}

	// Sort by time for consistent output.
	sort.Slice(events, func(i, j int) bool {
		return events[i].Timestamp.Before(events[j].Timestamp)
	})

	var sb strings.Builder
	sb.WriteString("Incident Timeline\n\n")
	for _, e := range events {
		sb.WriteString(fmt.Sprintf("%s %s\n", e.Timestamp.Format("15:04:05"), e.Message))
	}
	return strings.TrimRight(sb.String(), "\n")
}

func FormatRootCause(rootCause string) string {
	rc := strings.TrimSpace(rootCause)
	if rc == "" {
		return "Root Cause\n\n(not available)"
	}
	return "Root Cause\n\n" + rc
}

func FormatSimilarIncidents(similar []models.SimilarIncident) string {
	if len(similar) == 0 {
		return "Similar Incidents\n\n(none)"
	}

	// Ensure descending order by score for consistent output.
	sort.Slice(similar, func(i, j int) bool {
		return similar[i].Score > similar[j].Score
	})

	var sb strings.Builder
	sb.WriteString("Similar Incidents\n\n")
	for _, s := range similar {
		sb.WriteString(fmt.Sprintf("#%s (score %.2f)\n", s.IncidentID, s.Score))
	}
	return strings.TrimRight(sb.String(), "\n")
}

// BuildSlackBlocks builds a minimal Block Kit response for Slack.
// It keeps the same data as the plain-text "msg" but formats it for readability.
func BuildSlackBlocks(action, incidentID, msg string) []map[string]any {
	title := fmt.Sprintf("🚨 Incident #%s", incidentID)
	blocks := []map[string]any{
		{
			"type": "section",
			"text": map[string]any{
				"type": "mrkdwn",
				"text": "*" + title + "*",
			},
		},
	}

	body := strings.TrimSpace(msg)
	if body == "" {
		return blocks
	}

	// Remove the first heading line if present (e.g. "Root Cause", "Incident Timeline").
	lines := strings.Split(body, "\n")
	if len(lines) > 0 {
		switch strings.ToLower(strings.TrimSpace(lines[0])) {
		case "incident timeline", "root cause", "similar incidents", "status":
			lines = lines[1:]
		}
	}
	// Drop leading blank lines.
	for len(lines) > 0 && strings.TrimSpace(lines[0]) == "" {
		lines = lines[1:]
	}
	content := strings.TrimSpace(strings.Join(lines, "\n"))

	var sectionTitle string
	switch action {
	case "timeline":
		sectionTitle = "Incident Timeline"
		content = "```" + content + "```"
	case "rootcause":
		sectionTitle = "Root Cause"
	case "similar":
		sectionTitle = "Similar Incidents"
		// Convert "#24 (score 0.88)" to "• #24 (0.88)".
		var out []string
		for _, l := range strings.Split(content, "\n") {
			l = strings.TrimSpace(l)
			if l == "" {
				continue
			}
			l = strings.Replace(l, "(score ", "(", 1)
			out = append(out, "• "+l)
		}
		content = strings.Join(out, "\n")
	case "status":
		sectionTitle = "Status"
	default:
		sectionTitle = strings.Title(action)
	}

	blocks = append(blocks,
		map[string]any{"type": "divider"},
		map[string]any{
			"type": "section",
			"text": map[string]any{
				"type": "mrkdwn",
				"text": "*" + sectionTitle + "*\n" + content,
			},
		},
	)

	return blocks
}
