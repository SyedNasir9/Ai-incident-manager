package observability

import (
	"context"
	"time"
)

// IncidentMetrics groups key metric time series for an incident.
type IncidentMetrics struct {
	CPUUsage    []MetricPoint `json:"cpu_usage"`
	MemoryUsage []MetricPoint `json:"memory_usage"`
	ErrorRate   []MetricPoint `json:"error_rate"`
}

// IncidentSignals is the aggregated observability view for an incident.
type IncidentSignals struct {
	Metrics     IncidentMetrics   `json:"metrics"`
	Logs        []LogEntry        `json:"logs"`
	K8sEvents   []KubeEvent       `json:"k8s_events"`
	Deployments []KubeEvent       `json:"deployments"`
	Commits     []CommitInfo      `json:"commits"`
	MergedPRs   []PullRequestInfo `json:"merged_prs"`
}

// Collector coordinates calls to Prometheus, Loki, Kubernetes, and GitHub
// to assemble a combined observability view for an incident.
type Collector struct {
	prometheus *PrometheusClient
	loki       *LokiClient
	kubernetes *KubernetesClient
	github     *GitHubClient

	// Namespace used for Kubernetes event lookups.
	namespace string
}

// NewCollector constructs a new Collector.
func NewCollector(prom *PrometheusClient, loki *LokiClient, kube *KubernetesClient, gh *GitHubClient, namespace string) *Collector {
	return &Collector{
		prometheus: prom,
		loki:       loki,
		kubernetes: kube,
		github:     gh,
		namespace:  namespace,
	}
}

// CollectIncidentSignals gathers metrics, logs, and Kubernetes events around
// a given incident for the specified service, starting at startTime.
func (c *Collector) CollectIncidentSignals(service string, startTime time.Time) (*IncidentSignals, error) {
	ctx := context.Background()
	now := time.Now()

	var (
		metrics   IncidentMetrics
		logs      []LogEntry
		events    []KubeEvent
		commits   []CommitInfo
		mergedPRs []PullRequestInfo
	)

	// Fetch metrics from Prometheus, if configured.
	if c.prometheus != nil {
		if cpu, err := c.prometheus.FetchCPUUsage(service); err == nil {
			metrics.CPUUsage = cpu
		}
		if mem, err := c.prometheus.FetchMemoryUsage(service); err == nil {
			metrics.MemoryUsage = mem
		}
		if errRate, err := c.prometheus.FetchErrorRate(service); err == nil {
			metrics.ErrorRate = errRate
		}
	}

	// Fetch logs from Loki, if configured.
	if c.loki != nil {
		if l, err := c.loki.FetchServiceLogs(service, startTime, now, 200); err == nil {
			logs = l
		}
	}

	// Fetch Kubernetes events, if configured.
	if c.kubernetes != nil && c.namespace != "" {
		if ev, err := c.kubernetes.FetchNamespaceEvents(ctx, c.namespace, startTime); err == nil {
			events = ev
		}
	}

	// Fetch recent GitHub signals, if configured.
	// NOTE: Owner/repo are not derived from service here; caller should
	// construct Collector with a GitHubClient already scoped as needed.
	if c.github != nil {
		if cmt, err := c.github.FetchRecentCommits(service, service); err == nil {
			commits = cmt
		}
		if prs, err := c.github.FetchRecentMergedPRs(service, service); err == nil {
			mergedPRs = prs
		}
	}

	// Separate deployment-related events.
	var deployments []KubeEvent
	for _, e := range events {
		if e.InvolvedObjectKind == "Deployment" {
			deployments = append(deployments, e)
		}
	}

	return &IncidentSignals{
		Metrics:     metrics,
		Logs:        logs,
		K8sEvents:   events,
		Deployments: deployments,
		Commits:     commits,
		MergedPRs:   mergedPRs,
	}, nil
}

// defaultCollector allows using a package-level helper when only one
// collector instance is needed in the application.
var defaultCollector *Collector

// SetDefaultCollector sets the global collector used by the package-level
// CollectIncidentSignals helper.
func SetDefaultCollector(c *Collector) {
	defaultCollector = c
}

// CollectIncidentSignals is a convenience wrapper that delegates to the
// default Collector instance if configured, otherwise returns empty signals.
func CollectIncidentSignals(service string, startTime time.Time) (*IncidentSignals, error) {
	if defaultCollector == nil {
		return &IncidentSignals{}, nil
	}
	return defaultCollector.CollectIncidentSignals(service, startTime)
}

