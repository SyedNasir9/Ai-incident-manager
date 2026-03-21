package ai

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"

	"github.com/syednasir/ai-incident-manager/internal/storage"
	"github.com/syednasir/ai-incident-manager/pkg/models"
)

// AnalyzeAndStoreRootCause runs timeline analysis via Ollama to generate a
// root-cause explanation, then generates an embedding for that text and
// stores it using the provided EmbeddingRepository.
//
// It returns the root-cause text or an error.
func AnalyzeAndStoreRootCause(
	ctx context.Context,
	client *OllamaClient,
	repo *storage.EmbeddingRepository,
	incidentID string,
	timeline []models.TimelineEvent,
) (string, error) {
	if client == nil {
		return "", fmt.Errorf("ollama client is nil")
	}

	// 1. Generate root-cause text from the timeline.
	rootCause, err := client.AnalyzeTimeline(timeline)
	if err != nil {
		return "", fmt.Errorf("analyze timeline: %w", err)
	}

	// 2. Best-effort embedding generation + persistence for similarity search.
	// Failures here should NOT break the incident pipeline.
	if repo == nil {
		log.Printf("embedding storage skipped: embedding repository is nil (incident_id=%s)", incidentID)
	} else {
		vec, err := GenerateEmbedding(ctx, client, rootCause)
		if err != nil {
			log.Printf("embedding generation failed (incident_id=%s): %v", incidentID, err)
		} else {
			embedding := &models.IncidentEmbedding{
				ID:         uuid.NewString(),
				IncidentID: incidentID,
				Embedding:  vec,
				CreatedAt:  time.Now(),
			}

			if err := repo.SaveEmbedding(ctx, embedding); err != nil {
				log.Printf("embedding save failed (incident_id=%s): %v", incidentID, err)
			}
		}
	}

	return rootCause, nil
}

