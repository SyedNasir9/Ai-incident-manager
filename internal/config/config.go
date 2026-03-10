package config

import (
	"fmt"

	"github.com/spf13/viper"
)

// ServerConfig holds HTTP server related configuration.
type ServerConfig struct {
	Port int `mapstructure:"port"`
}

// Config is the root application configuration structure.
type Config struct {
	Server ServerConfig `mapstructure:"server"`
}

// Load reads configuration from the provided path using Viper.
// Example path: "configs/config.yaml".
func Load(path string) (*Config, error) {
	v := viper.New()
	v.SetConfigFile(path)

	// Reasonable default in case the config file omits the port.
	v.SetDefault("server.port", 8080)

	if err := v.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("read config: %w", err)
	}

	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("unmarshal config: %w", err)
	}

	return &cfg, nil
}

