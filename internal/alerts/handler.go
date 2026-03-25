package alerts

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"

	"github.com/syednasir/ai-incident-manager/internal/utils"
)

// RegisterRoutes registers alert-related HTTP routes on the provided router.
func RegisterRoutes(r gin.IRoutes, db *pgxpool.Pool, logger *zap.Logger) {
	r.POST("/alerts", func(c *gin.Context) {
		handleAlertWebhook(c, db, logger)
	})
}

// handleAlertWebhook handles POST /alerts from Prometheus Alertmanager.
func handleAlertWebhook(c *gin.Context, db *pgxpool.Pool, logger *zap.Logger) {
	// Set request timeout
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Minute)
	defer cancel()

	// Parse and validate payload
	var payload AlertManagerWebhook
	if err := c.ShouldBindJSON(&payload); err != nil {
		logger.Error("Invalid alertmanager payload",
			zap.Error(err),
			zap.String("client_ip", c.ClientIP()))
		utils.RespondBadRequest(c, fmt.Errorf("invalid alertmanager payload: %w", err))
		return
	}

	// Validate payload structure
	if len(payload.Alerts) == 0 {
		logger.Warn("No alerts in payload",
			zap.String("client_ip", c.ClientIP()))
		utils.RespondBadRequest(c, fmt.Errorf("no alerts in payload"))
		return
	}

	if len(payload.Alerts) > 10 {
		logger.Warn("Too many alerts in payload",
			zap.Int("alert_count", len(payload.Alerts)),
			zap.String("client_ip", c.ClientIP()))
		utils.RespondBadRequest(c, fmt.Errorf("too many alerts (max 10 per request)"))
		return
	}

	alert := payload.Alerts[0]

	// Validate alert data
	validation := utils.ValidateAlertPayload(alert.Labels.Service, alert.Labels.Severity, alert.StartsAt.Format(time.RFC3339))
	if !validation.Valid {
		logger.Error("Alert validation failed",
			zap.Strings("errors", func() []string {
				errors := make([]string, len(validation.Errors))
				for i, err := range validation.Errors {
					errors[i] = err.Error()
				}
				return errors
			}()),
			zap.String("client_ip", c.ClientIP()))
		utils.RespondWithValidationError(c, validation)
		return
	}

	logger.Info("Received alert webhook",
		zap.String("service", alert.Labels.Service),
		zap.String("severity", alert.Labels.Severity),
		zap.Time("starts_at", alert.StartsAt),
		zap.String("status", alert.Status),
		zap.Strings("all_labels", func() []string {
			labels := alert.Labels.All()
			result := make([]string, 0, len(labels))
			for k, v := range labels {
				result = append(result, fmt.Sprintf("%s=%s", k, v))
			}
			return result
		}()),
		zap.String("client_ip", c.ClientIP()))

	// Process through the complete pipeline
	result, err := ProcessAlertPipeline(ctx, logger, db, payload)

	if err != nil {
		logger.Error("Alert processing pipeline failed",
			zap.Error(err),
			zap.String("service", alert.Labels.Service),
			zap.String("severity", alert.Labels.Severity),
			zap.String("client_ip", c.ClientIP()))

		// Check if it's a validation error or internal error
		if _, ok := err.(utils.ValidationError); ok {
			utils.RespondWithValidationError(c, utils.ValidationResult{
				Valid:  false,
				Errors: []utils.ValidationError{{Field: "pipeline", Message: err.Error()}},
			})
		} else {
			utils.RespondInternalError(c, fmt.Errorf("alert processing failed: %w", err))
		}
		return
	}

	// Prepare response
	response := gin.H{
		"incident_id":        result.IncidentID,
		"success":            result.Success,
		"steps_completed":    result.StepsCompleted,
		"processing_time_ms": 0, // Will be calculated below
	}

	// Add warnings and errors if present
	if len(result.Warnings) > 0 {
		response["warnings"] = result.Warnings
	}
	if len(result.Errors) > 0 {
		response["errors"] = result.Errors
	}

	// Calculate total processing time
	totalTime := time.Duration(0)
	for _, duration := range result.StepsCompleted {
		totalTime += duration
	}
	response["processing_time_ms"] = totalTime.Milliseconds()

	// Log final result
	if result.Success {
		logger.Info("Alert processing completed successfully",
			zap.Int("incident_id", result.IncidentID),
			zap.String("service", alert.Labels.Service),
			zap.Duration("total_time", totalTime),
			zap.Int("steps_completed", len(result.StepsCompleted)),
			zap.String("client_ip", c.ClientIP()))
		utils.RespondWithSuccess(c, response)
	} else {
		logger.Warn("Alert processing completed with issues",
			zap.Int("incident_id", result.IncidentID),
			zap.String("service", alert.Labels.Service),
			zap.Duration("total_time", totalTime),
			zap.Strings("errors", result.Errors),
			zap.Strings("warnings", result.Warnings),
			zap.String("client_ip", c.ClientIP()))

		// Return partial success with warnings/errors
		c.JSON(http.StatusMultiStatus, response) // 207 - indicates partial success
	}
}
