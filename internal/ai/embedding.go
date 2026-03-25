package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// GenerateEmbedding calls the Ollama embeddings endpoint and returns
// the embedding vector for the provided text.
func GenerateEmbedding(ctx context.Context, client *OllamaClient, text string) ([]float64, error) {
	if client == nil {
		return nil, fmt.Errorf("ollama client is nil")
	}

	reqBody := map[string]interface{}{
		"model":  client.Model,
		"prompt": text,
	}

	b, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("marshal embedding request: %w", err)
	}

	url := strings.TrimRight(client.BaseURL, "/") + "/api/embeddings"

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(b))
	if err != nil {
		return nil, fmt.Errorf("create embedding request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("call ollama embeddings: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("ollama embeddings returned status %d", resp.StatusCode)
	}

	var out struct {
		Embedding []float64 `json:"embedding"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, fmt.Errorf("decode embedding response: %w", err)
	}

	if out.Embedding == nil {
		return nil, fmt.Errorf("embedding response missing vector")
	}

	return out.Embedding, nil
}
