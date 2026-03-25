package incidents

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"

	"github.com/syednasir/ai-incident-manager/internal/storage"
	"github.com/syednasir/ai-incident-manager/internal/utils"
)

type rootCauseResponse struct {
	RootCause string `json:"root_cause"`
}

// RegisterDetailRoutes registers GET /incidents/:id, timeline, and root-cause.
func RegisterDetailRoutes(r gin.IRoutes, db *pgxpool.Pool, logger *zap.Logger) {
	r.GET("/incidents/:id", func(c *gin.Context) {
		handleGetIncident(c, db, logger)
	})
	r.GET("/incidents/:id/timeline", func(c *gin.Context) {
		handleGetTimeline(c, db, logger)
	})
	r.GET("/incidents/:id/root-cause", func(c *gin.Context) {
		handleGetRootCause(c, db, logger)
	})
}

func handleGetIncident(c *gin.Context, db *pgxpool.Pool, logger *zap.Logger) {
	idStr := c.Param("id")

	// Validate incident ID
	if err := utils.ValidateIncidentID(idStr); err != nil {
		logger.Warn("Invalid incident ID requested",
			zap.String("id", idStr),
			zap.String("client_ip", c.ClientIP()),
			zap.Error(err))
		utils.RespondWithValidationError(c, utils.ValidationResult{
			Valid:  false,
			Errors: []utils.ValidationError{{Field: "id", Message: err.Error()}},
		})
		return
	}

	id, _ := strconv.Atoi(idStr) // Safe after validation

	incident, err := storage.GetIncidentByID(c.Request.Context(), db, id)
	if err != nil {
		if err.Error() == "no rows in result set" {
			logger.Info("Incident not found",
				zap.Int("id", id),
				zap.String("client_ip", c.ClientIP()))
			utils.RespondNotFound(c, "incident not found")
		} else {
			logger.Error("Failed to get incident",
				zap.Error(err),
				zap.Int("id", id),
				zap.String("client_ip", c.ClientIP()))
			utils.RespondInternalError(c, err)
		}
		return
	}

	logger.Debug("Retrieved incident",
		zap.Int("id", id),
		zap.String("service", incident.Service),
		zap.String("client_ip", c.ClientIP()))

	utils.RespondWithSuccess(c, incident)
}

func handleGetTimeline(c *gin.Context, db *pgxpool.Pool, logger *zap.Logger) {
	idStr := c.Param("id")

	// Validate incident ID
	if err := utils.ValidateIncidentID(idStr); err != nil {
		logger.Warn("Invalid incident ID for timeline",
			zap.String("id", idStr),
			zap.String("client_ip", c.ClientIP()),
			zap.Error(err))
		utils.RespondWithValidationError(c, utils.ValidationResult{
			Valid:  false,
			Errors: []utils.ValidationError{{Field: "id", Message: err.Error()}},
		})
		return
	}

	id, _ := strconv.Atoi(idStr) // Safe after validation

	events, err := storage.GetTimelineEvents(c.Request.Context(), db, id)
	if err != nil {
		logger.Error("Failed to get timeline events",
			zap.Error(err),
			zap.Int("id", id),
			zap.String("client_ip", c.ClientIP()))
		utils.RespondInternalError(c, err)
		return
	}

	logger.Debug("Retrieved timeline events",
		zap.Int("id", id),
		zap.Int("event_count", len(events)),
		zap.String("client_ip", c.ClientIP()))

	utils.RespondWithSuccess(c, events)
}

func handleGetRootCause(c *gin.Context, db *pgxpool.Pool, logger *zap.Logger) {
	idStr := c.Param("id")

	// Validate incident ID
	if err := utils.ValidateIncidentID(idStr); err != nil {
		logger.Warn("Invalid incident ID for root cause",
			zap.String("id", idStr),
			zap.String("client_ip", c.ClientIP()),
			zap.Error(err))
		utils.RespondWithValidationError(c, utils.ValidationResult{
			Valid:  false,
			Errors: []utils.ValidationError{{Field: "id", Message: err.Error()}},
		})
		return
	}

	id, _ := strconv.Atoi(idStr) // Safe after validation

	rootCause, err := storage.GetLatestRootCause(c.Request.Context(), db, id)
	if err != nil {
		logger.Error("Failed to get root cause",
			zap.Error(err),
			zap.Int("id", id),
			zap.String("client_ip", c.ClientIP()))
		utils.RespondInternalError(c, err)
		return
	}

	response := map[string]interface{}{
		"incident_id": id,
		"root_cause":  rootCause,
	}

	logger.Debug("Retrieved root cause",
		zap.Int("id", id),
		zap.Bool("has_root_cause", rootCause != ""),
		zap.String("client_ip", c.ClientIP()))

	utils.RespondWithSuccess(c, response)
}

func incidentPathID(c *gin.Context) (int, bool) {
	s := c.Param("id")
	id, err := strconv.Atoi(s)
	if err != nil || id < 1 {
		return 0, false
	}
	return id, true
}
