package alerts

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/syednasir/ai-incident-manager/internal/similarity"
	"github.com/syednasir/ai-incident-manager/internal/storage"
)

// RegisterSimilarRoutes registers the similar-incident lookup endpoint.
func RegisterSimilarRoutes(r gin.IRoutes, repo *storage.EmbeddingRepository, svc *similarity.SimilarityService) {
	r.GET("/incidents/:id/similar", func(c *gin.Context) {
		handleSimilarIncidents(c, repo, svc)
	})
}

func handleSimilarIncidents(
	c *gin.Context,
	repo *storage.EmbeddingRepository,
	svc *similarity.SimilarityService,
) {
	ctx := c.Request.Context()
	incidentID := c.Param("id")

	// 1. Fetch the embedding for the requested incident.
	queryEmbedding, err := repo.GetEmbeddingByIncidentID(ctx, incidentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load embedding"})
		return
	}
	if queryEmbedding == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "embedding not found for incident"})
		return
	}

	// 2. Find similar incidents.
	similar, err := svc.FindSimilarIncidents(ctx, incidentID, queryEmbedding.Embedding, 5)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to compute similarities"})
		return
	}

	// 3. Return JSON response.
	c.JSON(http.StatusOK, gin.H{
		"incident_id":       incidentID,
		"similar_incidents": similar,
	})
}

