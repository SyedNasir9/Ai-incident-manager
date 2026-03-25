package grafana

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/syednasir/ai-incident-manager/pkg/models"
)

type annotationRequest struct {
	Time int64    `json:"time"`
	Text string   `json:"text"`
	Tags []string `json:"tags,omitempty"`
	Type string   `json:"type,omitempty"`
}

func enabled() bool {
	v := strings.TrimSpace(strings.ToLower(os.Getenv("GRAFANA_ANNOTATIONS_ENABLED")))
	if v == "" {
		return false
	}
	switch v {
	case "1", "true", "yes", "y", "on":
		return true
	default:
		return false
	}
}

func grafanaBaseURL() string {
	u := strings.TrimSpace(os.Getenv("GRAFANA_URL"))
	return strings.TrimRight(u, "/")
}

func grafanaAPIKey() string {
	return strings.TrimSpace(os.Getenv("GRAFANA_API_KEY"))
}

func annotationType() string {
	t := strings.TrimSpace(os.Getenv("GRAFANA_ANNOTATION_TYPE"))
	if t == "" {
		return "incident_timeline"
	}
	return t
}

// #region agent log: SendAnnotation to Grafana (best-effort)
// SendAnnotation sends a single timeline event to Grafana as an annotation.
// It is gated behind env var `GRAFANA_ANNOTATIONS_ENABLED=true`.
func SendAnnotation(event models.TimelineEvent) error {
	if !enabled() {
		return nil
	}

	if event.IncidentID == 0 {
		return fmt.Errorf("missing IncidentID on timeline event")
	}

	baseURL := grafanaBaseURL()
	if baseURL == "" {
		return fmt.Errorf("GRAFANA_URL is not set")
	}
	apiKey := grafanaAPIKey()
	if apiKey == "" {
		return fmt.Errorf("GRAFANA_API_KEY is not set")
	}

	// Grafana expects epoch milliseconds.
	if event.Timestamp.IsZero() {
		return fmt.Errorf("missing timestamp on timeline event")
	}

	text := strings.TrimSpace(event.Message)
	if strings.TrimSpace(event.Source) != "" {
		text = fmt.Sprintf("%s - %s", strings.TrimSpace(event.Source), text)
	}

	reqBody := annotationRequest{
		Time: event.Timestamp.UnixMilli(),
		Text: text,
		Tags: []string{fmt.Sprintf("incident_id:%d", event.IncidentID)},
		Type: annotationType(),
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("marshal annotation request: %w", err)
	}

	endpoint := baseURL + "/api/annotations"
	httpClient := &http.Client{Timeout: 10 * time.Second}

	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(bodyBytes))
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("grafana returned status %d", resp.StatusCode)
	}

	return nil
}

// #endregion agent log
