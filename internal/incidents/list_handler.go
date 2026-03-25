package incidents

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"

	"github.com/syednasir/ai-incident-manager/internal/storage"
	"github.com/syednasir/ai-incident-manager/internal/utils"
	"github.com/syednasir/ai-incident-manager/pkg/models"
)

const (
	defaultPageSize = 20
	maxPageSize     = 100
)

type listResponse struct {
	Incidents []models.Incident `json:"incidents"`
	Page      int               `json:"page"`
	PageSize  int               `json:"page_size"`
	Total     int               `json:"total"`
}

// RegisterListRoutes registers GET /incidents with optional pagination.
func RegisterListRoutes(r gin.IRoutes, db *pgxpool.Pool, logger *zap.Logger) {
	r.GET("/incidents", func(c *gin.Context) {
		handleListIncidents(c, db, logger)
	})
}

func handleListIncidents(c *gin.Context, db *pgxpool.Pool, logger *zap.Logger) {
	// Validate pagination parameters
	page, pageSize, err := utils.ValidatePagination(
		c.Query("page"),
		c.Query("page_size"),
	)
	if err != nil {
		logger.Warn("Invalid pagination parameters",
			zap.String("page", c.Query("page")),
			zap.String("page_size", c.Query("page_size")),
			zap.String("client_ip", c.ClientIP()),
			zap.Error(err))
		utils.RespondWithValidationError(c, utils.ValidationResult{
			Valid:  false,
			Errors: []utils.ValidationError{{Field: "pagination", Message: err.Error()}},
		})
		return
	}

	incidents, err := storage.ListIncidents(c.Request.Context(), db, page, pageSize)
	if err != nil {
		logger.Error("Failed to list incidents",
			zap.Error(err),
			zap.Int("page", page),
			zap.Int("page_size", pageSize),
			zap.String("client_ip", c.ClientIP()))
		utils.RespondInternalError(c, err)
		return
	}

	total, err := storage.CountIncidents(c.Request.Context(), db)
	if err != nil {
		logger.Error("Failed to count incidents",
			zap.Error(err),
			zap.String("client_ip", c.ClientIP()))
		utils.RespondInternalError(c, err)
		return
	}

	response := listResponse{
		Incidents: incidents,
		Page:      page,
		PageSize:  pageSize,
		Total:     total,
	}

	logger.Debug("Retrieved incident list",
		zap.Int("page", page),
		zap.Int("page_size", pageSize),
		zap.Int("incident_count", len(incidents)),
		zap.Int("total", total),
		zap.String("client_ip", c.ClientIP()))

	utils.RespondWithSuccess(c, response)
}

func parsePositiveInt(s string, fallback int) int {
	n, err := strconv.Atoi(s)
	if err != nil || n < 1 {
		return fallback
	}
	return n
}
