package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/syednasir/ai-incident-manager/internal/utils"
	"github.com/syednasir/ai-incident-manager/pkg/models"
	"go.uber.org/zap"
)

type OllamaClient struct {
	BaseURL    string
	Model      string
	HTTPClient *http.Client
	Logger     *zap.Logger
}

func NewOllamaClient(baseURL string, model string) *OllamaClient {
	logger, _ := zap.NewProduction()

	return &OllamaClient{
		BaseURL: baseURL,
		Model:   model,
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second, // Reduced timeout for better responsiveness
		},
		Logger: logger,
	}
}

func (c *OllamaClient) AnalyzeTimeline(timeline []models.TimelineEvent) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	prompt := buildTimelinePrompt(timeline)

	retryConfig := utils.DefaultRetryConfig()
	retryConfig.MaxAttempts = 3
	retryConfig.InitialDelay = 2 * time.Second
	retryConfig.MaxDelay = 15 * time.Second

	var result string
	err := utils.RetryWithResult(ctx, retryConfig, func() (string, error) {
		return c.analyzeOnce(ctx, prompt)
	})

	if err != nil {
		c.Logger.Error("Ollama analysis failed after retries",
			zap.Error(err),
			zap.String("model", c.Model),
			zap.Int("timeline_events", len(timeline)))
		return "", fmt.Errorf("ollama analysis failed: %w", err)
	}

	c.Logger.Info("Ollama analysis completed",
		zap.String("model", c.Model),
		zap.Int("timeline_events", len(timeline)),
		zap.Int("response_length", len(result)))

	return result, nil
}

func (c *OllamaClient) analyzeOnce(ctx context.Context, prompt string) (string, error) {
	reqBody := map[string]interface{}{
		"model":  c.Model,
		"prompt": prompt,
		"stream": false,
	}

	b, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("marshal request: %w", err)
	}

	url := strings.TrimRight(c.BaseURL, "/") + "/api/generate"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(b))
	if err != nil {
		return "", fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("call ollama: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("ollama returned status %d", resp.StatusCode)
	}

	var out struct {
		Response string `json:"response"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return "", fmt.Errorf("decode response: %w", err)
	}

	if strings.TrimSpace(out.Response) == "" {
		return "", fmt.Errorf("ollama returned empty response")
	}

	return strings.TrimSpace(out.Response), nil
}

func buildTimelinePrompt(timeline []models.TimelineEvent) string {
	var sb strings.Builder

	sb.WriteString("You are an SRE assistant analyzing an incident timeline.\n\n")
	sb.WriteString("Timeline:\n")
	for _, e := range timeline {
		sb.WriteString(fmt.Sprintf("%s %s %s\n", e.Timestamp.Format("2006-01-02 15:04:05"), e.Source, e.Message))
	}

	sb.WriteString("\nAnalyze the events and explain the most likely root cause of the incident.\n")
	sb.WriteString("Focus on causal relationships between events.\n\n")
	sb.WriteString("Respond in 2-3 concise sentences.\n")
	return sb.String()
}
