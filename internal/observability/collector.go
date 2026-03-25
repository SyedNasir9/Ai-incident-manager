package observability

import (
	"context"
	"fmt"
	"log"
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
// Returns errors for critical failures but continues with partial data for non-critical failures.
func (c *Collector) CollectIncidentSignals(service string, startTime time.Time) (*IncidentSignals, error) {
	ctx := context.Background()
	now := time.Now()

	var (
		metrics   IncidentMetrics
		logs      []LogEntry
		events    []KubeEvent
		commits   []CommitInfo
		mergedPRs []PullRequestInfo
		errors    []string
	)

	// Fetch metrics from Prometheus, if configured.
	if c.prometheus != nil {
		if cpu, err := c.prometheus.FetchCPUUsage(service); err != nil {
			errors = append(errors, fmt.Sprintf("CPU metrics failed: %v", err))
			log.Printf("Failed to fetch CPU usage for service %s: %v", service, err)
		} else {
			metrics.CPUUsage = cpu
		}

		if mem, err := c.prometheus.FetchMemoryUsage(service); err != nil {
			errors = append(errors, fmt.Sprintf("Memory metrics failed: %v", err))
			log.Printf("Failed to fetch memory usage for service %s: %v", service, err)
		} else {
			metrics.MemoryUsage = mem
		}

		if errRate, err := c.prometheus.FetchErrorRate(service); err != nil {
			errors = append(errors, fmt.Sprintf("Error rate metrics failed: %v", err))
			log.Printf("Failed to fetch error rate for service %s: %v", service, err)
		} else {
			metrics.ErrorRate = errRate
		}
	} else {
		errors = append(errors, "Prometheus client not configured")
		log.Printf("Prometheus client not configured for service %s", service)
	}

	// Fetch logs from Loki, if configured.
	if c.loki != nil {
		if l, err := c.loki.FetchServiceLogs(service, startTime, now, 200); err != nil {
			errors = append(errors, fmt.Sprintf("Log collection failed: %v", err))
			log.Printf("Failed to fetch logs for service %s: %v", service, err)
		} else {
			logs = l
		}
	} else {
		errors = append(errors, "Loki client not configured")
		log.Printf("Loki client not configured for service %s", service)
	}

	// Fetch Kubernetes events, if configured.
	if c.kubernetes != nil && c.namespace != "" {
		if ev, err := c.kubernetes.FetchNamespaceEvents(ctx, c.namespace, startTime); err != nil {
			errors = append(errors, fmt.Sprintf("Kubernetes events failed: %v", err))
			log.Printf("Failed to fetch Kubernetes events for service %s: %v", service, err)
		} else {
			events = ev
		}
	} else if c.kubernetes == nil {
		errors = append(errors, "Kubernetes client not configured")
		log.Printf("Kubernetes client not configured for service %s", service)
	} else {
		errors = append(errors, "Kubernetes namespace not configured")
		log.Printf("Kubernetes namespace not configured for service %s", service)
	}

	// Fetch recent GitHub signals, if configured.
	// NOTE: Owner/repo are not derived from service here; caller should
	// construct Collector with a GitHubClient already scoped as needed.
	if c.github != nil {
		if cmt, err := c.github.FetchRecentCommits(service, service); err != nil {
			errors = append(errors, fmt.Sprintf("GitHub commits failed: %v", err))
			log.Printf("Failed to fetch GitHub commits for service %s: %v", service, err)
		} else {
			commits = cmt
		}

		if prs, err := c.github.FetchRecentMergedPRs(service, service); err != nil {
			errors = append(errors, fmt.Sprintf("GitHub PRs failed: %v", err))
			log.Printf("Failed to fetch GitHub PRs for service %s: %v", service, err)
		} else {
			mergedPRs = prs
		}
	} else {
		errors = append(errors, "GitHub client not configured")
		log.Printf("GitHub client not configured for service %s", service)
	}

	// Separate deployment-related events.
	var deployments []KubeEvent
	for _, e := range events {
		if e.InvolvedObjectKind == "Deployment" {
			deployments = append(deployments, e)
		}
	}

	// Log collection summary
	log.Printf("Observability collection summary for service %s: %d metrics, %d logs, %d events, %d commits, %d PRs",
		service,
		len(metrics.CPUUsage)+len(metrics.MemoryUsage)+len(metrics.ErrorRate),
		len(logs),
		len(events),
		len(commits),
		len(mergedPRs))

	// Return partial data with errors if any occurred
	signals := &IncidentSignals{
		Metrics:     metrics,
		Logs:        logs,
		K8sEvents:   events,
		Deployments: deployments,
		Commits:     commits,
		MergedPRs:   mergedPRs,
	}

	// If we have some data, return it with errors. If we have no data at all, return an error.
	hasAnyData := len(metrics.CPUUsage) > 0 || len(metrics.MemoryUsage) > 0 || len(metrics.ErrorRate) > 0 ||
		len(logs) > 0 || len(events) > 0 || len(commits) > 0 || len(mergedPRs) > 0

	if !hasAnyData {
		return nil, fmt.Errorf("no observability data collected for service %s: %v", service, errors)
	}

	// Log errors but don't fail the collection if we have some data
	if len(errors) > 0 {
		log.Printf("Observability collection completed with %d errors for service %s: %v", len(errors), service, errors)
	}

	return signals, nil
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
