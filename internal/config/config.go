package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/spf13/viper"
)

// DatabaseConfig holds database related configuration.
type DatabaseConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	DBName   string `mapstructure:"dbname"`
	SSLMode  string `mapstructure:"sslmode"`
}

// ServerConfig holds HTTP server related configuration.
type ServerConfig struct {
	Port int    `mapstructure:"port"`
	Mode string `mapstructure:"mode"`
}

// AIConfig holds AI service related configuration.
type AIConfig struct {
	OllamaURL string `mapstructure:"ollama_url"`
	Model     string `mapstructure:"model"`
}

// ObservabilityConfig holds observability service configuration.
type ObservabilityConfig struct {
	PrometheusURL string `mapstructure:"prometheus_url"`
	LokiURL       string `mapstructure:"loki_url"`
	GrafanaURL    string `mapstructure:"grafana_url"`
	GrafanaAPIKey string `mapstructure:"grafana_api_key"`
	Namespace     string `mapstructure:"namespace"`
}

// SecurityConfig holds security related configuration.
type SecurityConfig struct {
	JWTSecret     string `mapstructure:"jwt_secret"`
	SessionSecret string `mapstructure:"session_secret"`
}

// CORSConfig holds CORS configuration.
type CORSConfig struct {
	Origins []string `mapstructure:"origins"`
}

// Config is the root application configuration structure.
type Config struct {
	Database      DatabaseConfig      `mapstructure:"database"`
	Server        ServerConfig        `mapstructure:"server"`
	AI            AIConfig            `mapstructure:"ai"`
	Observability ObservabilityConfig `mapstructure:"observability"`
	Security      SecurityConfig      `mapstructure:"security"`
	CORS          CORSConfig          `mapstructure:"cors"`
}

// Load reads configuration from environment variables and config file using Viper.
// Environment variables take precedence over config file values.
func Load(path string) (*Config, error) {
	v := viper.New()

	// Set up environment variable prefix
	v.SetEnvPrefix("AI_INCIDENT_")

	// Load config file if it exists
	v.SetConfigFile(path)

	// Set defaults for all configuration sections
	setDefaults(v)

	// Read environment variables
	v.AutomaticEnv()

	// Read config file
	if err := v.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("read config: %w", err)
	}

	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("unmarshal config: %w", err)
	}

	// Post-process configuration
	processConfig(&cfg)

	return &cfg, nil
}

// setDefaults sets reasonable defaults for all configuration values.
func setDefaults(v *viper.Viper) {
	// Server defaults
	v.SetDefault("server.port", 8081)
	v.SetDefault("server.mode", "release")

	// Database defaults
	v.SetDefault("database.host", "localhost")
	v.SetDefault("database.port", 5432)
	v.SetDefault("database.user", "postgres")
	v.SetDefault("database.password", "postgres")
	v.SetDefault("database.dbname", "incidentdb")
	v.SetDefault("database.sslmode", "disable")

	// AI service defaults
	v.SetDefault("ai.ollama_url", "http://localhost:11434")
	v.SetDefault("ai.model", "tinyllama")

	// Observability defaults
	v.SetDefault("observability.prometheus_url", "http://localhost:9090")
	v.SetDefault("observability.loki_url", "http://localhost:3100")
	v.SetDefault("observability.grafana_url", "http://localhost:3001")
	v.SetDefault("observability.grafana_api_key", "")
	v.SetDefault("observability.namespace", "ai-incident-manager")

	// Security defaults
	v.SetDefault("security.jwt_secret", "dev-jwt-secret")
	v.SetDefault("security.session_secret", "dev-session-secret")

	// CORS defaults
	v.SetDefault("cors.origins", []string{"http://localhost:3000", "http://localhost:8081"})
}

// processConfig performs post-processing of configuration values.
func processConfig(cfg *Config) {
	// Process CORS origins from comma-separated string
	if len(cfg.CORS.Origins) == 1 {
		originsStr := cfg.CORS.Origins[0]
		if strings.Contains(originsStr, ",") {
			cfg.CORS.Origins = strings.Split(originsStr, ",")
			// Trim whitespace from each origin
			for i, origin := range cfg.CORS.Origins {
				cfg.CORS.Origins[i] = strings.TrimSpace(origin)
			}
		}
	}

	// Ensure URLs don't have trailing slashes
	cfg.AI.OllamaURL = strings.TrimRight(cfg.AI.OllamaURL, "/")
	cfg.Observability.PrometheusURL = strings.TrimRight(cfg.Observability.PrometheusURL, "/")
	cfg.Observability.LokiURL = strings.TrimRight(cfg.Observability.LokiURL, "/")
	cfg.Observability.GrafanaURL = strings.TrimRight(cfg.Observability.GrafanaURL, "/")
}

// GetDatabaseURL returns the database connection string.
func (c *Config) GetDatabaseURL() string {
	return fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=%s",
		c.Database.User,
		c.Database.Password,
		c.Database.Host,
		c.Database.Port,
		c.Database.DBName,
		c.Database.SSLMode,
	)
}

// GetEnvVar returns an environment variable value with fallback.
func GetEnvVar(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
