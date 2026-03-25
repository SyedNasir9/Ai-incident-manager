package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// ErrorResponse represents a standardized error response
type ErrorResponse struct {
	Error   string `json:"error"`
	Code    string `json:"code,omitempty"`
	Details string `json:"details,omitempty"`
}

// ValidationErrorResponse represents validation error response
type ValidationErrorResponse struct {
	Error   string                 `json:"error"`
	Details map[string]string      `json:"details,omitempty"`
	Fields  []ValidationErrorField `json:"fields,omitempty"`
}

type ValidationErrorField struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// SuccessResponse represents a standardized success response
type SuccessResponse struct {
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
}

// Error codes
const (
	ErrCodeInvalidInput       = "INVALID_INPUT"
	ErrCodeNotFound           = "NOT_FOUND"
	ErrCodeInternalError      = "INTERNAL_ERROR"
	ErrCodeServiceUnavailable = "SERVICE_UNAVAILABLE"
	ErrCodeUnauthorized       = "UNAUTHORIZED"
	ErrCodeForbidden          = "FORBIDDEN"
)

// RespondWithError sends a standardized error response
func RespondWithError(c *gin.Context, statusCode int, err error, code string) {
	response := ErrorResponse{
		Error:   http.StatusText(statusCode),
		Code:    code,
		Details: err.Error(),
	}

	c.JSON(statusCode, response)
}

// RespondWithValidationError sends validation error response
func RespondWithValidationError(c *gin.Context, result ValidationResult) {
	response := ValidationErrorResponse{
		Error:   "validation failed",
		Details: make(map[string]string),
		Fields:  make([]ValidationErrorField, 0),
	}

	for _, err := range result.Errors {
		response.Details[err.Field] = err.Message
		response.Fields = append(response.Fields, ValidationErrorField{
			Field:   err.Field,
			Message: err.Message,
		})
	}

	c.JSON(http.StatusBadRequest, response)
}

// RespondWithSuccess sends a standardized success response
func RespondWithSuccess(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, SuccessResponse{
		Data: data,
	})
}

// RespondWithCreated sends a 201 response
func RespondWithCreated(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, SuccessResponse{
		Data:    data,
		Message: "created successfully",
	})
}

// Common error responses
func RespondBadRequest(c *gin.Context, err error) {
	RespondWithError(c, http.StatusBadRequest, err, ErrCodeInvalidInput)
}

func RespondNotFound(c *gin.Context, message string) {
	err := ValidationError{Field: "resource", Message: message}
	RespondWithError(c, http.StatusNotFound, err, ErrCodeNotFound)
}

func RespondInternalError(c *gin.Context, err error) {
	RespondWithError(c, http.StatusInternalServerError, err, ErrCodeInternalError)
}

func RespondServiceUnavailable(c *gin.Context, service string) {
	err := ValidationError{Field: "service", Message: service + " is currently unavailable"}
	RespondWithError(c, http.StatusServiceUnavailable, err, ErrCodeServiceUnavailable)
}

func RespondUnauthorized(c *gin.Context, message string) {
	err := ValidationError{Field: "auth", Message: message}
	RespondWithError(c, http.StatusUnauthorized, err, ErrCodeUnauthorized)
}
