package alerts

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/google/uuid"

	"github.com/syednasir/ai-incident-manager/internal/ai"
	"github.com/syednasir/ai-incident-manager/internal/observability"
	"github.com/syednasir/ai-incident-manager/internal/storage"
	"github.com/syednasir/ai-incident-manager/internal/timeline"
	"github.com/syednasir/ai-incident-manager/pkg/models"
)

// RegisterRoutes registers alert-related HTTP routes on the provided router.
func RegisterRoutes(r gin.IRoutes, db *pgxpool.Pool) {
	r.POST("/alerts", func(c *gin.Context) {
		handleAlertWebhook(c, db)
	})
}

// handleAlertWebhook handles POST /alerts from Prometheus Alertmanager.
func handleAlertWebhook(c *gin.Context, db *pgxpool.Pool) {
	var payload AlertManagerWebhook
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid alertmanager payload"})
		return
	}

	if len(payload.Alerts) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no alerts in payload"})
		return
	}

	alert := payload.Alerts[0]

	incident := models.Incident{
		Service:   alert.Labels.Service,
		Severity:  alert.Labels.Severity,
		StartTime: alert.StartsAt, // already time.Time
		Status:    "open",
	}

	id, err := storage.CreateIncident(c.Request.Context(), db, incident)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to store incident"})
		return
	}

	incident.ID = id

	signals, err := observability.CollectIncidentSignals(
		alert.Labels.Service,
		incident.StartTime,
	)
	if err != nil {
		log.Printf("observability collection failed: %v", err)
	} else {
		tl := timeline.BuildTimeline(*signals)
		ctx := c.Request.Context()

		// Persist timeline and observability data for this incident.
		if err := storage.SaveTimeline(ctx, db, incident.ID, tl); err != nil {
			log.Printf("failed to save timeline: %v", err)
		} else {
			log.Printf("timeline saved: %d events", len(tl))
		}

		if err := storage.SaveMetrics(ctx, db, incident.ID, signals.Metrics); err != nil {
			log.Printf("failed to save metrics: %v", err)
		} else {
			log.Printf("metrics saved for incident %d", incident.ID)
		}

		if err := storage.SaveLogs(ctx, db, incident.ID, signals.Logs); err != nil {
			log.Printf("failed to save logs: %v", err)
		} else {
			log.Printf("logs saved: %d entries", len(signals.Logs))
		}

		if err := storage.SaveKubernetesEvents(ctx, db, incident.ID, signals.K8sEvents); err != nil {
			log.Printf("failed to save Kubernetes events: %v", err)
		} else {
			log.Printf("Kubernetes events saved: %d entries", len(signals.K8sEvents))
		}

		// AI root-cause analysis based on timeline.
		if ai.DefaultClient == nil {
			log.Println("AI analysis skipped: Ollama client not configured")
		} else {
			rootCause, err := ai.DefaultClient.AnalyzeTimeline(tl)
			if err != nil {
				log.Printf("AI analysis failed: %v", err)
			} else {
				log.Printf("AI root cause: %s", rootCause)
				if err := storage.SaveRootCause(ctx, db, incident.ID, rootCause); err != nil {
					log.Printf("failed to save root cause: %v", err)
				} else {
					log.Printf("root cause saved for incident %d", incident.ID)
				}

				// Best-effort: generate + store embedding for the root-cause text.
				vec, err := ai.GenerateEmbedding(ctx, ai.DefaultClient, rootCause)
				if err != nil {
					log.Printf("embedding generation failed: %v", err)
				} else {
					repo := storage.NewEmbeddingRepository(db)
					emb := &models.IncidentEmbedding{
						ID:         uuid.NewString(),
						IncidentID: fmt.Sprintf("%d", incident.ID),
						Embedding:  vec,
					}
					if err := repo.SaveEmbedding(ctx, emb); err != nil {
						log.Printf("embedding save failed: %v", err)
					} else {
						log.Printf("embedding saved for incident %d", incident.ID)
					}
				}
			}
		}

		// Log the human-readable incident timeline to stdout.
		if len(tl) == 0 {
			log.Println("Incident timeline: no events collected")
		} else {
			log.Println("Incident timeline:")
			for _, ev := range tl {
				fmt.Printf("%s [%s] %s\n",
					ev.Timestamp.Format("2006-01-02 15:04:05"),
					ev.Source,
					ev.Message,
				)
			}
		}
	}

	c.JSON(http.StatusOK, incident)
}

