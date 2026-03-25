package alerts

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"

	"github.com/syednasir/ai-incident-manager/internal/ai"
	"github.com/syednasir/ai-incident-manager/internal/grafana"
	"github.com/syednasir/ai-incident-manager/internal/observability"
	"github.com/syednasir/ai-incident-manager/internal/storage"
	"github.com/syednasir/ai-incident-manager/internal/timeline"
	"github.com/syednasir/ai-incident-manager/pkg/models"
)

// PipelineResult represents the result of processing an alert through the pipeline
type PipelineResult struct {
	IncidentID     int                      `json:"incident_id"`
	Success        bool                     `json:"success"`
	StepsCompleted map[string]time.Duration `json:"steps_completed"`
	Errors         []string                 `json:"errors,omitempty"`
	Warnings       []string                 `json:"warnings,omitempty"`
}

// PipelineStage represents a stage in the processing pipeline
type PipelineStage struct {
	Name     string
	Execute  func(ctx context.Context, incident *models.Incident) error
	Fallback func(ctx context.Context, incident *models.Incident) error
	Required bool // Whether this stage must succeed for pipeline to continue
}

// ProcessAlertPipeline processes an alert through the complete end-to-end pipeline
func ProcessAlertPipeline(ctx context.Context, logger *zap.Logger, db *pgxpool.Pool, alert AlertManagerWebhook) (*PipelineResult, error) {
	startTime := time.Now()

	if len(alert.Alerts) == 0 {
		return nil, fmt.Errorf("no alerts in payload")
	}

	alertData := alert.Alerts[0]
	result := &PipelineResult{
		StepsCompleted: make(map[string]time.Duration),
		Errors:         []string{},
		Warnings:       []string{},
	}

	logger.Info("Starting alert processing pipeline",
		zap.String("service", alertData.Labels.Service),
		zap.String("severity", alertData.Labels.Severity),
		zap.Time("start_time", alertData.StartsAt),
	)

	// Stage 1: Create Incident
	incident, err := createIncidentStage(ctx, logger, db, alertData, result)
	if err != nil {
		return nil, fmt.Errorf("failed to create incident: %w", err)
	}
	result.IncidentID = incident.ID

	// Stage 2: Collect Observability Signals
	signals, err := collectSignalsStage(ctx, logger, incident, result)
	if err != nil && !result.Success {
		return result, fmt.Errorf("signal collection failed: %w", err)
	}

	// Stage 3: Build and Save Timeline
	timelineEvents, err := buildTimelineStage(ctx, logger, db, incident, signals, result)
	if err != nil && !result.Success {
		return result, fmt.Errorf("timeline building failed: %w", err)
	}

	// Stage 4: Generate AI Root Cause
	rootCause, err := generateRootCauseStage(ctx, logger, db, incident, timelineEvents, result)
	if err != nil && !result.Success {
		return result, fmt.Errorf("root cause generation failed: %w", err)
	}

	// Stage 5: Generate and Store Embedding
	err = generateEmbeddingStage(ctx, logger, db, incident, rootCause, result)
	if err != nil && !result.Success {
		return result, fmt.Errorf("embedding generation failed: %w", err)
	}

	// Stage 6: Send Grafana Annotations (best effort)
	sendAnnotationsStage(ctx, logger, timelineEvents, result)

	// Calculate total processing time
	totalTime := time.Since(startTime)
	logger.Info("Alert processing pipeline completed",
		zap.Int("incident_id", result.IncidentID),
		zap.Bool("success", result.Success),
		zap.Duration("total_time", totalTime),
		zap.Int("steps_completed", len(result.StepsCompleted)),
		zap.Strings("errors", result.Errors),
		zap.Strings("warnings", result.Warnings),
	)

	return result, nil
}

// createIncidentStage creates the incident record
func createIncidentStage(ctx context.Context, logger *zap.Logger, db *pgxpool.Pool, alert Alert, result *PipelineResult) (*models.Incident, error) {
	stageStart := time.Now()

	logger.Info("Stage 1: Creating incident record",
		zap.String("service", alert.Labels.Service),
		zap.String("severity", alert.Labels.Severity),
	)

	incident := models.Incident{
		Service:   alert.Labels.Service,
		Severity:  alert.Labels.Severity,
		StartTime: alert.StartsAt,
		Status:    "open",
	}

	id, err := storage.CreateIncident(ctx, db, incident)
	if err != nil {
		result.Errors = append(result.Errors, fmt.Sprintf("Failed to create incident: %v", err))
		result.Success = false
		return nil, fmt.Errorf("create incident failed: %w", err)
	}

	incident.ID = id
	result.StepsCompleted["create_incident"] = time.Since(stageStart)

	logger.Info("Incident created successfully",
		zap.Int("incident_id", id),
		zap.String("service", incident.Service),
		zap.Duration("duration", result.StepsCompleted["create_incident"]),
	)

	return &incident, nil
}

// collectSignalsStage collects observability signals
func collectSignalsStage(ctx context.Context, logger *zap.Logger, incident *models.Incident, result *PipelineResult) (*observability.IncidentSignals, error) {
	stageStart := time.Now()

	logger.Info("Stage 2: Collecting observability signals",
		zap.Int("incident_id", incident.ID),
		zap.String("service", incident.Service),
		zap.Time("start_time", incident.StartTime),
	)

	signals, err := observability.CollectIncidentSignals(incident.Service, incident.StartTime)
	if err != nil {
		result.Warnings = append(result.Warnings, fmt.Sprintf("Signal collection failed: %v", err))
		logger.Warn("Signal collection failed, using fallback",
			zap.Error(err),
			zap.Int("incident_id", incident.ID),
		)

		// Fallback: Create empty signals structure
		signals = &observability.IncidentSignals{
			Metrics:     observability.IncidentMetrics{},
			Logs:        []observability.LogEntry{},
			K8sEvents:   []observability.KubeEvent{},
			Deployments: []observability.KubeEvent{},
			Commits:     []observability.CommitInfo{},
			MergedPRs:   []observability.PullRequestInfo{},
		}
	}

	result.StepsCompleted["collect_signals"] = time.Since(stageStart)

	logger.Info("Signal collection completed",
		zap.Int("incident_id", incident.ID),
		zap.Int("metrics_count", len(signals.Metrics.CPUUsage)+len(signals.Metrics.MemoryUsage)+len(signals.Metrics.ErrorRate)),
		zap.Int("logs_count", len(signals.Logs)),
		zap.Int("k8s_events_count", len(signals.K8sEvents)),
		zap.Duration("duration", result.StepsCompleted["collect_signals"]),
	)

	return signals, nil
}

// buildTimelineStage builds and saves timeline
func buildTimelineStage(ctx context.Context, logger *zap.Logger, db *pgxpool.Pool, incident *models.Incident, signals *observability.IncidentSignals, result *PipelineResult) ([]models.TimelineEvent, error) {
	logger.Info("Stage 3: Building and saving timeline",
		zap.Int("incident_id", incident.ID),
	)

	// Build timeline from signals
	timelineEvents := timeline.BuildTimeline(*signals)

	// Add incident start event if no events exist
	if len(timelineEvents) == 0 {
		logger.Info("No events collected, creating incident start event",
			zap.Int("incident_id", incident.ID),
		)
		timelineEvents = []models.TimelineEvent{
			{
				Timestamp:  incident.StartTime,
				Source:     "system",
				Message:    fmt.Sprintf("Incident %d started for service %s with severity %s", incident.ID, incident.Service, incident.Severity),
				IncidentID: incident.ID,
			},
		}
		result.Warnings = append(result.Warnings, "No observability events collected, created system event")
	}

	// Save timeline to database
	if err := storage.SaveTimeline(ctx, db, incident.ID, timelineEvents); err != nil {
		result.Errors = append(result.Errors, fmt.Sprintf("Failed to save timeline: %v", err))
		result.Success = false
		return nil, fmt.Errorf("save timeline failed: %w", err)
	}

	// Save metrics
	if err := storage.SaveMetrics(ctx, db, incident.ID, signals.Metrics); err != nil {
		result.Warnings = append(result.Warnings, fmt.Sprintf("Failed to save metrics: %v", err))
		logger.Warn("Failed to save metrics", zap.Error(err), zap.Int("incident_id", incident.ID))
	} else {
		logger.Info("Metrics saved", zap.Int("incident_id", incident.ID))
	}

	// Save logs
	if err := storage.SaveLogs(ctx, db, incident.ID, signals.Logs); err != nil {
		result.Warnings = append(result.Warnings, fmt.Sprintf("Failed to save logs: %v", err))
		logger.Warn("Failed to save logs", zap.Error(err), zap.Int("incident_id", incident.ID))
	} else {
		logger.Info("Logs saved", zap.Int("incident_id", incident.ID), zap.Int("count", len(signals.Logs)))
	}

	// Save Kubernetes events
	if err := storage.SaveKubernetesEvents(ctx, db, incident.ID, signals.K8sEvents); err != nil {
		result.Warnings = append(result.Warnings, fmt.Sprintf("Failed to save Kubernetes events: %v", err))
		logger.Warn("Failed to save Kubernetes events", zap.Error(err), zap.Int("incident_id", incident.ID))
	} else {
		logger.Info("Kubernetes events saved", zap.Int("incident_id", incident.ID), zap.Int("count", len(signals.K8sEvents)))
	}

	return timelineEvents, nil
}

// generateRootCauseStage generates root cause analysis
func generateRootCauseStage(ctx context.Context, logger *zap.Logger, db *pgxpool.Pool, incident *models.Incident, timelineEvents []models.TimelineEvent, result *PipelineResult) (string, error) {
	stageStart := time.Now()

	logger.Info("Stage 4: Generating root cause analysis",
		zap.Int("incident_id", incident.ID),
		zap.Int("timeline_events", len(timelineEvents)),
	)

	var rootCause string
	var err error

	if len(timelineEvents) == 0 {
		rootCause = "No timeline events available for analysis"
		result.Warnings = append(result.Warnings, "No timeline events available for root cause analysis")
	} else {
		rootCause, err = ai.DefaultClient.AnalyzeTimeline(timelineEvents)
		if err != nil {
			result.Warnings = append(result.Warnings, fmt.Sprintf("AI analysis failed: %v", err))
			logger.Warn("AI analysis failed, using fallback",
				zap.Error(err),
				zap.Int("incident_id", incident.ID),
			)
			rootCause = "Unable to generate root cause due to analysis failure"
		}
	}

	// Save root cause to database
	if err := storage.SaveRootCause(ctx, db, incident.ID, rootCause); err != nil {
		result.Errors = append(result.Errors, fmt.Sprintf("Failed to save root cause: %v", err))
		result.Success = false
		return "", fmt.Errorf("save root cause failed: %w", err)
	}

	result.StepsCompleted["generate_root_cause"] = time.Since(stageStart)

	logger.Info("Root cause generation completed",
		zap.Int("incident_id", incident.ID),
		zap.String("root_cause_preview", rootCause[:min(100, len(rootCause))]),
		zap.Duration("duration", result.StepsCompleted["generate_root_cause"]),
	)

	return rootCause, nil
}

// generateEmbeddingStage generates and stores embeddings
func generateEmbeddingStage(ctx context.Context, logger *zap.Logger, db *pgxpool.Pool, incident *models.Incident, rootCause string, result *PipelineResult) error {
	stageStart := time.Now()

	logger.Info("Stage 5: Generating and storing embeddings",
		zap.Int("incident_id", incident.ID),
	)

	var embedding []float64
	var err error

	if ai.DefaultClient == nil {
		result.Warnings = append(result.Warnings, "AI client not configured, skipping embedding generation")
		logger.Warn("AI client not configured, skipping embedding generation",
			zap.Int("incident_id", incident.ID),
		)
		result.StepsCompleted["generate_embedding"] = time.Since(stageStart)
		return nil
	}

	// Generate embedding from root cause
	embedding, err = ai.GenerateEmbedding(ctx, ai.DefaultClient, rootCause)
	if err != nil {
		result.Warnings = append(result.Warnings, fmt.Sprintf("Embedding generation failed: %v", err))
		logger.Warn("Embedding generation failed, skipping similarity search",
			zap.Error(err),
			zap.Int("incident_id", incident.ID),
		)
		result.StepsCompleted["generate_embedding"] = time.Since(stageStart)
		return nil
	}

	// Store embedding
	repo := storage.NewEmbeddingRepository(db)
	emb := &models.IncidentEmbedding{
		ID:         uuid.NewString(),
		IncidentID: incident.ID, // Use int directly
		Embedding:  embedding,
	}

	if err := repo.SaveEmbedding(ctx, emb); err != nil {
		result.Warnings = append(result.Warnings, fmt.Sprintf("Failed to save embedding: %v", err))
		logger.Warn("Failed to save embedding",
			zap.Error(err),
			zap.Int("incident_id", incident.ID),
		)
	} else {
		logger.Info("Embedding saved successfully",
			zap.Int("incident_id", incident.ID),
			zap.Int("embedding_size", len(embedding)),
		)
	}

	result.StepsCompleted["generate_embedding"] = time.Since(stageStart)

	logger.Info("Embedding generation completed",
		zap.Int("incident_id", incident.ID),
		zap.Duration("duration", result.StepsCompleted["generate_embedding"]),
	)

	return nil
}

// sendAnnotationsStage sends Grafana annotations (best effort)
func sendAnnotationsStage(ctx context.Context, logger *zap.Logger, timelineEvents []models.TimelineEvent, result *PipelineResult) {
	stageStart := time.Now()

	logger.Info("Stage 6: Sending Grafana annotations (best effort)",
		zap.Int("timeline_events", len(timelineEvents)),
	)

	annotationCount := 0
	for i := range timelineEvents {
		if err := grafana.SendAnnotation(timelineEvents[i]); err != nil {
			result.Warnings = append(result.Warnings, fmt.Sprintf("Failed to send Grafana annotation: %v", err))
			logger.Debug("Failed to send Grafana annotation",
				zap.Error(err),
				zap.Time("timestamp", timelineEvents[i].Timestamp),
				zap.String("source", timelineEvents[i].Source),
			)
		} else {
			annotationCount++
		}
	}

	result.StepsCompleted["send_annotations"] = time.Since(stageStart)

	logger.Info("Grafana annotations completed",
		zap.Int("sent", annotationCount),
		zap.Int("total", len(timelineEvents)),
		zap.Duration("duration", result.StepsCompleted["send_annotations"]),
	)
}

// min returns the minimum of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
