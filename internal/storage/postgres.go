package storage

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

// NewPostgresPool creates and returns a new pgx connection pool
// using configuration loaded via Viper from configs/config.yaml.
func NewPostgresPool() (*pgxpool.Pool, error) {
	// Configure Viper to read the application config.
	v := viper.New()
	v.SetConfigFile("configs/config.yaml")

	// Sensible defaults in case some fields are missing.
	v.SetDefault("database.host", "localhost")
	v.SetDefault("database.port", 5432)
	v.SetDefault("database.user", "postgres")
	v.SetDefault("database.password", "postgres")
	v.SetDefault("database.dbname", "incidentdb")
	v.SetDefault("database.sslmode", "disable")

	if err := v.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("read database config: %w", err)
	}

	type dbConfig struct {
		Host     string `mapstructure:"host"`
		Port     int    `mapstructure:"port"`
		User     string `mapstructure:"user"`
		Password string `mapstructure:"password"`
		DBName   string `mapstructure:"dbname"`
		SSLMode  string `mapstructure:"sslmode"`
	}

	var cfg dbConfig
	if err := v.UnmarshalKey("database", &cfg); err != nil {
		return nil, fmt.Errorf("unmarshal database config: %w", err)
	}

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=%s",
		cfg.User,
		cfg.Password,
		cfg.Host,
		cfg.Port,
		cfg.DBName,
		cfg.SSLMode,
	)

	// Initialize a Zap logger for structured logging.
	logger, err := zap.NewProduction()
	if err != nil {
		return nil, fmt.Errorf("init zap logger: %w", err)
	}

	poolCfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		logger.Error("failed to parse Postgres DSN", zap.Error(err))
		_ = logger.Sync()
		return nil, fmt.Errorf("parse postgres dsn: %w", err)
	}

	pool, err := pgxpool.NewWithConfig(context.Background(), poolCfg)
	if err != nil {
		logger.Error("failed to create Postgres pool", zap.Error(err))
		_ = logger.Sync()
		return nil, fmt.Errorf("create postgres pool: %w", err)
	}

	// Verify the connection with a short-lived ping.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := pool.Ping(ctx); err != nil {
		logger.Error("failed to ping Postgres", zap.Error(err))
		pool.Close()
		_ = logger.Sync()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	logger.Info("Postgres connection pool established successfully")
	// We intentionally do not sync/close the logger here so it can continue
	// to be used by the application if desired.

	return pool, nil
}

