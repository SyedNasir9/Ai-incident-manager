package main

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"github.com/syednasir/ai-incident-manager/internal/alerts"
	"github.com/syednasir/ai-incident-manager/internal/chatops"
	"github.com/syednasir/ai-incident-manager/internal/config"
	"github.com/syednasir/ai-incident-manager/internal/incidents"
	appLogger "github.com/syednasir/ai-incident-manager/internal/logger"
	"github.com/syednasir/ai-incident-manager/internal/observability"
	"github.com/syednasir/ai-incident-manager/internal/similarity"
	"github.com/syednasir/ai-incident-manager/internal/storage"
)

func main() {
	// Initialize structured logger (Zap).
	logger, err := appLogger.New()
	if err != nil {
		log.Fatalf("failed to initialize logger: %v", err)
	}
	defer func() {
		_ = logger.Sync()
	}()

	// Load configuration using Viper (environment variables take precedence)
	cfg, err := config.Load("configs/config.yaml")
	if err != nil {
		logger.Fatal("failed to load configuration", zap.Error(err))
	}

	// Initialize observability collector (Prometheus, Loki, etc.).
	prometheusURL := os.Getenv("PROMETHEUS_URL")
	if prometheusURL == "" {
		prometheusURL = "http://localhost:9090" // fallback for local dev
	}

	lokiURL := os.Getenv("LOKI_URL")
	if lokiURL == "" {
		lokiURL = "http://localhost:3100" // fallback for local dev
	}

	promClient := observability.NewPrometheusClient(prometheusURL)
	lokiClient := observability.NewLokiClient(lokiURL)

	collector := observability.NewCollector(
		promClient,
		lokiClient,
		nil,                         // Kubernetes client can be wired later
		nil,                         // GitHub client can be wired later
		cfg.Observability.Namespace, // namespace for Kubernetes events
	)
	observability.SetDefaultCollector(collector)

	// Connect to PostgreSQL using internal/storage.
	pool, err := storage.NewPostgresPool()
	if err != nil {
		logger.Fatal("failed to initialize Postgres pool", zap.Error(err))
	}
	defer pool.Close()

	// Initialize embedding repository and similarity service (reuse DB pool).
	embeddingRepo := storage.NewEmbeddingRepository(pool)
	simSvc := similarity.NewSimilarityService(embeddingRepo)

	// Set up Gin router.
	router := gin.New()
	router.Use(gin.Recovery())

	// Register HTTP routes.
	alerts.RegisterRoutes(router, pool, logger)
	incidents.RegisterListRoutes(router, pool, logger)
	incidents.RegisterDetailRoutes(router, pool, logger)
	incidents.RegisterEmbeddingRoutes(router, pool, logger)
	// Register similar-incident routes.
	alerts.RegisterSimilarRoutes(router, embeddingRepo, simSvc)

	// Slack ChatOps service wiring.
	chatops.SetSlackServices(chatops.SlackServices{
		Timeline: func(c *gin.Context, incidentID string) (string, error) {
			id, err := strconv.Atoi(incidentID)
			if err != nil {
				return "", fmt.Errorf("invalid incident_id %q", incidentID)
			}
			events, err := storage.GetTimelineEvents(c.Request.Context(), pool, id)
			if err != nil {
				return "", err
			}
			return chatops.FormatTimeline(events), nil
		},
		RootCause: func(c *gin.Context, incidentID string) (string, error) {
			id, err := strconv.Atoi(incidentID)
			if err != nil {
				return "", fmt.Errorf("invalid incident_id %q", incidentID)
			}
			rc, err := storage.GetLatestRootCause(c.Request.Context(), pool, id)
			if err != nil {
				return "", err
			}
			return chatops.FormatRootCause(rc), nil
		},
		Similar: func(c *gin.Context, incidentID string) (string, error) {
			emb, err := embeddingRepo.GetEmbeddingByIncidentID(c.Request.Context(), incidentID)
			if err != nil {
				return "", err
			}
			if emb == nil {
				return "", fmt.Errorf("embedding not found for incident %q", incidentID)
			}
			similar, err := simSvc.FindSimilarIncidents(c.Request.Context(), incidentID, emb.Embedding, 5)
			if err != nil {
				return "", err
			}
			return chatops.FormatSimilarIncidents(similar), nil
		},
		Status: func(c *gin.Context, incidentID string) (string, error) {
			id, err := strconv.Atoi(incidentID)
			if err != nil {
				return "", fmt.Errorf("invalid incident_id %q", incidentID)
			}
			status, err := storage.GetIncidentStatus(c.Request.Context(), pool, id)
			if err != nil {
				return "", err
			}
			if status == "" {
				return "Status\n\n(not found)", nil
			}
			return "Status\n\n" + status, nil
		},
	})
	router.POST("/slack/commands", chatops.HandleSlackCommand)

	// Simple health endpoint.
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	logger.Info("starting HTTP server", zap.String("addr", addr))

	if err := router.Run(addr); err != nil {
		logger.Fatal("server exited with error", zap.Error(err))
	}
}
