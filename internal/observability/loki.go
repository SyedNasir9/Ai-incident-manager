package observability

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

// LogEntry represents a single log line with its timestamp.
type LogEntry struct {
	Timestamp time.Time `json:"timestamp"`
	Message   string    `json:"message"`
}

// LokiClient is a small wrapper around the Loki HTTP API.
type LokiClient struct {
	baseURL    string
	httpClient *http.Client
}

// NewLokiClient creates a new Loki client with the given base URL,
// e.g. "http://loki:3100".
func NewLokiClient(baseURL string) *LokiClient {
	return &LokiClient{
		baseURL:    baseURL,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

// FetchServiceLogs queries Loki for logs of the given Kubernetes service
// between start and end times.
func (c *LokiClient) FetchServiceLogs(service string, start, end time.Time, limit int) ([]LogEntry, error) {
	if limit <= 0 {
		limit = 100
	}

	u, err := url.Parse(c.baseURL)
	if err != nil {
		return nil, fmt.Errorf("parse base URL: %w", err)
	}
	u.Path = "/loki/api/v1/query_range"

	// Example log query; adjust labels to match your cluster conventions.
	// This assumes Kubernetes logs with a label `service`.
	query := fmt.Sprintf(`{service="%s"}`, service)

	q := u.Query()
	q.Set("query", query)
	q.Set("start", fmt.Sprintf("%d", start.UnixNano()))
	q.Set("end", fmt.Sprintf("%d", end.UnixNano()))
	q.Set("limit", fmt.Sprintf("%d", limit))
	q.Set("direction", "backward")
	u.RawQuery = q.Encode()

	req, err := http.NewRequest(http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code from loki: %d", resp.StatusCode)
	}

	var lr lokiResponse
	if err := json.NewDecoder(resp.Body).Decode(&lr); err != nil {
		return nil, fmt.Errorf("decode loki response: %w", err)
	}

	entries := make([]LogEntry, 0)
	for _, stream := range lr.Data.Result {
		for _, v := range stream.Values {
			if len(v) != 2 {
				continue
			}

			// v[0] is nanosecond timestamp as string.
			tsNano, err := time.ParseDuration(v[0] + "ns")
			if err != nil {
				continue
			}

			entries = append(entries, LogEntry{
				Timestamp: time.Unix(0, tsNano.Nanoseconds()),
				Message:   v[1],
			})
		}
	}

	return entries, nil
}

// Types to unmarshal a minimal subset of the Loki query_range response.
type lokiResponse struct {
	Status string       `json:"status"`
	Data   lokiData     `json:"data"`
}

type lokiData struct {
	ResultType string         `json:"resultType"`
	Result     []lokiStream   `json:"result"`
}

type lokiStream struct {
	Stream map[string]string `json:"stream"`
	Values [][]string        `json:"values"`
}

