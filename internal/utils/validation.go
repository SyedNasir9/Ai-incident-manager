package utils

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// ValidationError represents a validation error
type ValidationError struct {
	Field   string
	Message string
}

func (v ValidationError) Error() string {
	return fmt.Sprintf("validation failed for %s: %s", v.Field, v.Message)
}

// ValidationResult holds validation results
type ValidationResult struct {
	Valid  bool
	Errors []ValidationError
}

// AddError adds a validation error
func (vr *ValidationResult) AddError(field, message string) {
	vr.Valid = false
	vr.Errors = append(vr.Errors, ValidationError{Field: field, Message: message})
}

// ValidateIncidentID validates incident ID parameter
func ValidateIncidentID(id string) error {
	if id == "" {
		return ValidationError{Field: "id", Message: "cannot be empty"}
	}

	num, err := strconv.Atoi(id)
	if err != nil {
		return ValidationError{Field: "id", Message: "must be a valid integer"}
	}

	if num <= 0 {
		return ValidationError{Field: "id", Message: "must be positive"}
	}

	return nil
}

// ValidateService validates service name
func ValidateService(service string) error {
	if service == "" {
		return ValidationError{Field: "service", Message: "cannot be empty"}
	}

	if len(service) > 100 {
		return ValidationError{Field: "service", Message: "too long (max 100 chars)"}
	}

	// Allow alphanumeric, hyphens, underscores, and dots
	matched, err := regexp.MatchString(`^[a-zA-Z0-9._-]+$`, service)
	if err != nil {
		return ValidationError{Field: "service", Message: "validation error"}
	}

	if !matched {
		return ValidationError{Field: "service", Message: "contains invalid characters"}
	}

	return nil
}

// ValidateSeverity validates severity level
func ValidateSeverity(severity string) error {
	if severity == "" {
		return ValidationError{Field: "severity", Message: "cannot be empty"}
	}

	validSeverities := map[string]bool{
		"low":      true,
		"medium":   true,
		"high":     true,
		"critical": true,
		"warning":  true,
		"error":    true,
	}

	if !validSeverities[strings.ToLower(severity)] {
		return ValidationError{Field: "severity", Message: "must be one of: low, medium, high, critical, warning, error"}
	}

	return nil
}

// ValidateTimestamp validates timestamp string
func ValidateTimestamp(ts string) error {
	if ts == "" {
		return ValidationError{Field: "timestamp", Message: "cannot be empty"}
	}

	// Try to parse as RFC3339
	_, err := time.Parse(time.RFC3339, ts)
	if err != nil {
		return ValidationError{Field: "timestamp", Message: "must be valid RFC3339 format"}
	}

	return nil
}

// ValidateAlertPayload validates alert webhook payload
func ValidateAlertPayload(service, severity, timestamp string) ValidationResult {
	result := ValidationResult{Valid: true}

	if err := ValidateService(service); err != nil {
		result.AddError("service", err.Error())
	}

	if err := ValidateSeverity(severity); err != nil {
		result.AddError("severity", err.Error())
	}

	if err := ValidateTimestamp(timestamp); err != nil {
		result.AddError("timestamp", err.Error())
	}

	return result
}

// ValidatePagination validates pagination parameters
func ValidatePagination(page, pageSize string) (int, int, error) {
	var p, ps int
	var err error

	if page == "" {
		p = 1
	} else {
		p, err = strconv.Atoi(page)
		if err != nil || p < 1 {
			return 0, 0, ValidationError{Field: "page", Message: "must be positive integer"}
		}
	}

	if pageSize == "" {
		ps = 20 // default
	} else {
		ps, err = strconv.Atoi(pageSize)
		if err != nil || ps < 1 || ps > 100 {
			return 0, 0, ValidationError{Field: "page_size", Message: "must be between 1 and 100"}
		}
	}

	return p, ps, nil
}
