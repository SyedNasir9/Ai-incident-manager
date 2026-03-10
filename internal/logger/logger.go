package logger

import (
	"go.uber.org/zap"
)

// New creates a new Zap logger instance configured for production use.
func New() (*zap.Logger, error) {
	return zap.NewProduction()
}

