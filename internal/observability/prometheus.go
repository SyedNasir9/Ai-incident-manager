package observability

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/syednasir/ai-incident-manager/internal/utils"
	"go.uber.org/zap"
)

// MetricPoint represents a single Prometheus sample value with its timestamp.
type MetricPoint struct {
	Timestamp time.Time `json:"timestamp"`
	Value     float64   `json:"value"`
}

// PrometheusClient is a small wrapper around the Prometheus HTTP API.
type PrometheusClient struct {
	baseURL    string
	httpClient *http.Client
	logger     *zap.Logger
}

// NewPrometheusClient creates a new client with the given base URL, e.g. "http://prometheus:9090".
func NewPrometheusClient(baseURL string) *PrometheusClient {
	logger, _ := zap.NewProduction()

	return &PrometheusClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 10 * time.Second, // Reasonable timeout for metrics queries
		},
		logger: logger,
	}
}

// FetchCPUUsage fetches CPU usage metrics for the given service label.
func (c *PrometheusClient) FetchCPUUsage(service string) ([]MetricPoint, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	expr := fmt.Sprintf(`rate(container_cpu_usage_seconds_total{service="%s"}[5m])`, service)

	retryConfig := utils.DefaultRetryConfig()
	retryConfig.MaxAttempts = 2 // Quick retry for metrics

	metrics, err := utils.RetryWithResult(ctx, retryConfig, func() ([]MetricPoint, error) {
		if m, err := c.queryInstant(ctx, expr); err != nil {
			c.logger.Warn("Failed to fetch CPU usage",
				zap.Error(err),
				zap.String("service", service))
			return nil, fmt.Errorf("cpu usage fetch failed: %w", err)
		}

		c.logger.Debug("Fetched CPU usage",
			zap.String("service", service),
			zap.Int("points", len(m)))

		return m, nil
	})

	if err != nil {
		return nil, err
	}

	return metrics, nil
}

// FetchMemoryUsage fetches memory usage metrics for the given service label.
func (c *PrometheusClient) FetchMemoryUsage(service string) ([]MetricPoint, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	expr := fmt.Sprintf(`container_memory_usage_bytes{service="%s"}`, service)

	retryConfig := utils.DefaultRetryConfig()
	retryConfig.MaxAttempts = 2

	metrics, err := utils.RetryWithResult(ctx, retryConfig, func() ([]MetricPoint, error) {
		if m, err := c.queryInstant(ctx, expr); err != nil {
			c.logger.Warn("Failed to fetch memory usage",
				zap.Error(err),
				zap.String("service", service))
			return nil, fmt.Errorf("memory usage fetch failed: %w", err)
		}

		c.logger.Debug("Fetched memory usage",
			zap.String("service", service),
			zap.Int("points", len(metrics)))

		return metrics, nil
	})

	if err != nil {
		return nil, err
	}

	return metrics, nil
}

// FetchErrorRate fetches error rate metrics for the given service label.
func (c *PrometheusClient) FetchErrorRate(service string) ([]MetricPoint, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	expr := fmt.Sprintf(`rate(http_requests_total{service="%s",status=~"5.."}[5m])`, service)

	retryConfig := utils.DefaultRetryConfig()
	retryConfig.MaxAttempts = 2

	metrics, err := utils.RetryWithResult(ctx, retryConfig, func() ([]MetricPoint, error) {
		if m, err := c.queryInstant(ctx, expr); err != nil {
			c.logger.Warn("Failed to fetch error rate",
				zap.Error(err),
				zap.String("service", service))
			return nil, fmt.Errorf("error rate fetch failed: %w", err)
		}

		c.logger.Debug("Fetched error rate",
			zap.String("service", service),
			zap.Int("points", len(metrics)))

		return metrics, nil
	})

	if err != nil {
		return nil, err
	}

	return metrics, nil
}

// queryInstant performs a /api/v1/query call and returns the resulting samples as MetricPoint values.
func (c *PrometheusClient) queryInstant(ctx context.Context, expr string) ([]MetricPoint, error) {
	u, err := url.Parse(c.baseURL)
	if err != nil {
		return nil, fmt.Errorf("parse base URL: %w", err)
	}
	u.Path = "/api/v1/query"

	q := u.Query()
	q.Set("query", expr)
	u.RawQuery = q.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code from prometheus: %d", resp.StatusCode)
	}

	var pr prometheusResponse
	if err := json.NewDecoder(resp.Body).Decode(&pr); err != nil {
		return nil, fmt.Errorf("decode prometheus response: %w", err)
	}

	points := make([]MetricPoint, 0, len(pr.Data.Result))
	for _, r := range pr.Data.Result {
		if len(r.Value) != 2 {
			continue
		}

		tsFloat, ok := r.Value[0].(float64)
		if !ok {
			continue
		}
		valueStr, ok := r.Value[1].(string)
		if !ok {
			continue
		}

		val, err := strconv.ParseFloat(valueStr, 64)
		if err != nil {
			continue
		}

		points = append(points, MetricPoint{
			Timestamp: time.Unix(int64(tsFloat), 0),
			Value:     val,
		})
	}

	return points, nil
}

// Types to unmarshal a minimal subset of the Prometheus query API response.
type prometheusResponse struct {
	Status string           `json:"status"`
	Data   prometheusResult `json:"data"`
}

type prometheusResult struct {
	ResultType string                 `json:"resultType"`
	Result     []prometheusResultItem `json:"result"`
}

type prometheusResultItem struct {
	Value []interface{} `json:"value"`
}
