## Build stage
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Allow the Go toolchain to auto-resolve the exact patch version specified in `go.mod`.
ENV GOTOOLCHAIN=auto

# Install build tools (if needed) and git for go modules
RUN apk add --no-cache git

# Copy go module files first for better caching
COPY go.mod ./
COPY go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the Go binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /app/server ./cmd/server

## Runtime stage
FROM alpine:3.19

WORKDIR /app

# Add CA certificates and curl for HTTPS calls and health checks
RUN apk add --no-cache ca-certificates curl

# Create non-root user
RUN adduser -D -g '' appuser

# Copy compiled binary from builder
COPY --from=builder /app/server /app/server
COPY configs /app/configs

EXPOSE 8081

USER appuser

CMD ["/app/server"]

