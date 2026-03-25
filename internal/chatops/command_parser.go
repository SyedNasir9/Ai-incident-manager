package chatops

import (
	"fmt"
	"strings"
)

type Command struct {
	Action     string
	IncidentID string
}

// ParseCommand parses a Slack slash-command "text" string.
//
// Expected input:
//
//	"<action> <incident_id>"
//
// Examples:
//
//	"timeline 21"
//	"rootcause 21"
//	"similar 21"
//	"status 21"
func ParseCommand(input string) (*Command, error) {
	fields := strings.Fields(strings.TrimSpace(input))
	if len(fields) < 2 {
		return nil, fmt.Errorf("expected: <action> <incident_id>")
	}

	action := strings.ToLower(fields[0])
	incidentID := fields[1]

	switch action {
	case "timeline", "rootcause", "similar", "status":
		// supported
	default:
		return nil, fmt.Errorf("invalid action %q (supported: timeline, rootcause, similar, status)", action)
	}

	if strings.TrimSpace(incidentID) == "" {
		return nil, fmt.Errorf("incident_id is required")
	}

	return &Command{
		Action:     action,
		IncidentID: incidentID,
	}, nil
}
