package chatops

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// SlackServices provides the service hooks used by the Slack slash-command handler.
// Wire these during server startup (optional).
type SlackServices struct {
	Timeline  func(ctx *gin.Context, incidentID string) (string, error)
	RootCause func(ctx *gin.Context, incidentID string) (string, error)
	Similar   func(ctx *gin.Context, incidentID string) (string, error)
	Status    func(ctx *gin.Context, incidentID string) (string, error)
}

var services SlackServices

// SetSlackServices configures the service hooks used by HandleSlackCommand.
func SetSlackServices(s SlackServices) {
	services = s
}

// HandleSlackCommand handles Slack slash command requests (application/x-www-form-urlencoded).
//
// It expects fields like:
//
//	command=/incident
//	text="timeline 21"
//
// Responds with a Slack-compatible JSON payload:
//
//	{"response_type":"in_channel","text":"..."}
func HandleSlackCommand(c *gin.Context) {
	command := c.PostForm("command")
	text := c.PostForm("text")

	if strings.TrimSpace(command) == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"response_type": "ephemeral",
			"text":          "Missing Slack form field: command",
		})
		return
	}

	parsed, err := ParseCommand(text)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"response_type": "ephemeral",
			"text":          fmt.Sprintf("Invalid command. Usage: `%s timeline <incident_id>` (or rootcause/similar/status). Error: %v", command, err),
		})
		return
	}

	var (
		msg string
	)

	switch parsed.Action {
	case "timeline":
		if services.Timeline == nil {
			c.JSON(http.StatusNotImplemented, gin.H{"response_type": "ephemeral", "text": "timeline service is not configured"})
			return
		}
		out, err := services.Timeline(c, parsed.IncidentID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"response_type": "ephemeral", "text": fmt.Sprintf("timeline failed: %v", err)})
			return
		}
		msg = out

	case "rootcause":
		if services.RootCause == nil {
			c.JSON(http.StatusNotImplemented, gin.H{"response_type": "ephemeral", "text": "rootcause service is not configured"})
			return
		}
		out, err := services.RootCause(c, parsed.IncidentID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"response_type": "ephemeral", "text": fmt.Sprintf("rootcause failed: %v", err)})
			return
		}
		msg = out

	case "similar":
		if services.Similar == nil {
			c.JSON(http.StatusNotImplemented, gin.H{"response_type": "ephemeral", "text": "similar service is not configured"})
			return
		}
		out, err := services.Similar(c, parsed.IncidentID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"response_type": "ephemeral", "text": fmt.Sprintf("similar failed: %v", err)})
			return
		}
		msg = out

	case "status":
		if services.Status == nil {
			c.JSON(http.StatusNotImplemented, gin.H{"response_type": "ephemeral", "text": "status service is not configured"})
			return
		}
		out, err := services.Status(c, parsed.IncidentID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"response_type": "ephemeral", "text": fmt.Sprintf("status failed: %v", err)})
			return
		}
		msg = out

	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"response_type": "ephemeral",
			"text":          "Unsupported command",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"response_type": "in_channel",
		"text":          msg, // fallback text (clients that don't render blocks)
		"blocks":        BuildSlackBlocks(parsed.Action, parsed.IncidentID, msg),
	})
}
