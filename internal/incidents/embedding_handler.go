package incidents

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"

	"github.com/syednasir/ai-incident-manager/internal/ai"
	"github.com/syednasir/ai-incident-manager/internal/storage"
	"github.com/syednasir/ai-incident-manager/internal/utils"
	"github.com/syednasir/ai-incident-manager/pkg/models"
)

// EmbeddingRequest represents the request body for embedding generation
type EmbeddingRequest struct {
	IncidentID int    `json:"incident_id" binding:"required,min=1"`
	Text       string `json:"text" binding:"required,min=1,max=10000"`
}

// EmbeddingResponse represents the response for embedding generation
type EmbeddingResponse struct {
	Success     bool   `json:"success"`
	Message     string `json:"message,omitempty"`
	EmbeddingID string `json:"embedding_id,omitempty"`
}

// validateEmbeddingRequest validates the embedding request
func validateEmbeddingRequest(req *EmbeddingRequest) error {
	if req.IncidentID <= 0 {
		return utils.NewValidationError("incident_id", "must be a positive integer")
	}

	if len(req.Text) == 0 {
		return utils.NewValidationError("text", "cannot be empty")
	}

	if len(req.Text) > 10000 {
		return utils.NewValidationError("text", "exceeds maximum length of 10000 characters")
	}

	return nil
}

// handleCreateEmbedding generates an embedding for the given text and stores it
func handleCreateEmbedding(c *gin.Context, db *pgxpool.Pool, logger *zap.Logger) {
	// Parse request body
	var req EmbeddingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Failed to parse embedding request",
			zap.Error(err),
			zap.String("client_ip", c.ClientIP()),
		)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request format",
			"error":   err.Error(),
		})
		return
	}

	// Validate request
	if err := validateEmbeddingRequest(&req); err != nil {
		logger.Error("Embedding request validation failed",
			zap.Error(err),
			zap.Int("incident_id", req.IncidentID),
			zap.Int("text_length", len(req.Text)),
			zap.String("client_ip", c.ClientIP()),
		)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
			"error":   "validation_error",
		})
		return
	}

	logger.Info("Processing embedding request",
		zap.Int("incident_id", req.IncidentID),
		zap.Int("text_length", len(req.Text)),
		zap.String("client_ip", c.ClientIP()),
	)

	// Generate embedding using Ollama
	embedding, err := ai.GenerateEmbedding(c.Request.Context(), ai.DefaultClient, req.Text)
	if err != nil {
		logger.Error("Failed to generate embedding",
			zap.Error(err),
			zap.Int("incident_id", req.IncidentID),
			zap.String("client_ip", c.ClientIP()),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to generate embedding",
			"error":   "generation_error",
		})
		return
	}

	// Store embedding in database
	embeddingRepo := storage.NewEmbeddingRepository(db)
	embeddingModel := &models.IncidentEmbedding{
		ID:         utils.GenerateUUID(),
		IncidentID: req.IncidentID,
		Embedding:  embedding,
		CreatedAt:  utils.Now(),
	}

	if err := embeddingRepo.SaveEmbedding(c.Request.Context(), embeddingModel); err != nil {
		logger.Error("Failed to store embedding",
			zap.Error(err),
			zap.Int("incident_id", req.IncidentID),
			zap.String("embedding_id", embeddingModel.ID),
			zap.String("client_ip", c.ClientIP()),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to store embedding",
			"error":   "storage_error",
		})
		return
	}

	logger.Info("Embedding generated and stored successfully",
		zap.Int("incident_id", req.IncidentID),
		zap.String("embedding_id", embeddingModel.ID),
		zap.Int("embedding_size", len(embedding)),
		zap.String("client_ip", c.ClientIP()),
	)

	// Return success response
	c.JSON(http.StatusOK, EmbeddingResponse{
		Success:     true,
		Message:     "Embedding generated and stored successfully",
		EmbeddingID: embeddingModel.ID,
	})
}

// RegisterEmbeddingRoutes registers the embedding endpoints
func RegisterEmbeddingRoutes(r gin.IRoutes, db *pgxpool.Pool, logger *zap.Logger) {
	r.POST("/api/embeddings", func(c *gin.Context) {
		handleCreateEmbedding(c, db, logger)
	})
}
