package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"github.com/syednasir/ai-incident-manager/internal/alerts"
	"github.com/syednasir/ai-incident-manager/internal/config"
	appLogger "github.com/syednasir/ai-incident-manager/internal/logger"
	"github.com/syednasir/ai-incident-manager/internal/observability"
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

	// Load configuration using Viper.
	cfg, err := config.Load("configs/config.yaml")
	if err != nil {
		logger.Fatal("failed to load configuration", zap.Error(err))
	}

	// Initialize observability collector (Prometheus, Loki, etc.).
	promClient := observability.NewPrometheusClient("http://localhost:9090")
	lokiClient := observability.NewLokiClient("http://localhost:3100")

	collector := observability.NewCollector(
		promClient,
		lokiClient,
		nil, // Kubernetes client can be wired later
		nil, // GitHub client can be wired later
		"",  // namespace for Kubernetes events
	)
	observability.SetDefaultCollector(collector)

	// Connect to PostgreSQL using internal/storage.
	pool, err := storage.NewPostgresPool()
	if err != nil {
		logger.Fatal("failed to initialize Postgres pool", zap.Error(err))
	}
	defer pool.Close()

	// Set up Gin router.
	router := gin.New()
	router.Use(gin.Recovery())

	// Register alert routes.
	alerts.RegisterRoutes(router, pool)

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


