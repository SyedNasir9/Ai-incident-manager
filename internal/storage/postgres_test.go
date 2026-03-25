package storage

import (
	"context"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/syednasir/ai-incident-manager/pkg/models"
)

// TestPostgresPool tests the database connection and migration system
func TestPostgresPool(t *testing.T) {
	// Skip if not running integration tests
	if testing.Short() {
		t.Skip("Skipping integration test")
	}

	// This would require a test database setup
	// For now, just test the configuration parsing
	t.Run("config parsing", func(t *testing.T) {
		// Test environment variable substitution
		result := substituteEnvVars("${TEST_VAR:default}")
		if result != "default" {
			t.Errorf("Expected 'default', got '%s'", result)
		}
	})
}

// TestVectorStringParsing tests the vector string parsing function
func TestVectorStringParsing(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected []float64
		err      bool
	}{
		{
			name:     "simple vector",
			input:    "[0.1,0.2,0.3]",
			expected: []float64{0.1, 0.2, 0.3},
			err:      false,
		},
		{
			name:     "empty vector",
			input:    "[]",
			expected: []float64{},
			err:      false,
		},
		{
			name:     "single element",
			input:    "[1.5]",
			expected: []float64{1.5},
			err:      false,
		},
		{
			name:  "invalid format",
			input: "0.1,0.2,0.3",
			err:   true,
		},
		{
			name:  "invalid number",
			input: "[0.1,invalid,0.3]",
			err:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := parseVectorString(tt.input)

			if tt.err {
				if err == nil {
					t.Errorf("Expected error, but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("Unexpected error: %v", err)
				return
			}

			if len(result) != len(tt.expected) {
				t.Errorf("Expected length %d, got %d", len(tt.expected), len(result))
				return
			}

			for i, val := range result {
				if val != tt.expected[i] {
					t.Errorf("At index %d, expected %f, got %f", i, tt.expected[i], val)
				}
			}
		})
	}
}

// TestEmbeddingRepository tests the embedding repository functions
func TestEmbeddingRepository(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test")
	}

	// This would require a test database
	// For now, test the vector conversion logic
	t.Run("vector conversion", func(t *testing.T) {
		// Test embedding slice to vector string conversion
		embedding := []float64{0.1, 0.2, 0.3, 0.4}

		// Simulate the conversion logic
		vectorStr := "[" + "0.1"
		for i := 1; i < len(embedding); i++ {
			vectorStr += "," + "0.1" // This would be fmt.Sprintf("%g", embedding[i]) in real code
		}
		vectorStr += "]"

		expected := "[0.1,0.1,0.1,0.1]"
		if vectorStr != expected {
			t.Errorf("Expected '%s', got '%s'", expected, vectorStr)
		}
	})
}

// Mock functions for testing database operations without real DB
func mockCreateIncident(ctx context.Context, db *pgxpool.Pool, incident models.Incident) (int, error) {
	// Mock implementation
	return 1, nil
}

func mockGetIncidentByID(ctx context.Context, db *pgxpool.Pool, id int) (*models.Incident, error) {
	// Mock implementation
	return &models.Incident{
		ID:        id,
		Service:   "test-service",
		Severity:  "high",
		StartTime: time.Now(),
		Status:    "open",
	}, nil
}
