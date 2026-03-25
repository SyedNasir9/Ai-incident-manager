# AI Incident Manager - Makefile
# Common commands for development and deployment

.PHONY: help up down logs build clean test lint format

# Default Docker Compose file
DOCKER_COMPOSE ?= docker-compose.production.yml

# Colors for output
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
NC := \033[0m

help: ## Show help
	@echo "$(BLUE)AI Incident Manager - Available Commands:$(NC)"
	@echo ""
	@echo "$(GREEN)  up$(NC)           - Start all services with Docker Compose"
	@echo "$(GREEN)  down$(NC)         - Stop all services"
	@echo "$(GREEN)  logs$(NC)        - Show service logs"
	@echo "$(GREEN)  build$(NC)       - Build Docker images"
	@echo "$(GREEN)  clean$(NC)      - Clean up Docker resources"
	@echo "$(GREEN)  test$(NC)       - Run tests"
	@echo "$(GREEN)  lint$(NC)       - Run linters"
	@echo "$(GREEN)  format$(NC)     - Format code"
	@echo "$(GREEN)  dev$(NC)        - Start development mode"
	@echo "$(GREEN)  prod$(NC)       - Start production mode"
	@echo ""
	@echo "$(YELLOW)Examples:$(NC)"
	@echo "  make up                    # Start all services"
	@echo "  make up -f docker-compose.yml  # Use development compose file"
	@echo "  make logs api            # Show only API logs"
	@echo "  make logs frontend        # Show only frontend logs"
	@echo "  make build api           # Build only API image"
	@echo "  make test backend        # Run backend tests"
	@echo "  make test frontend       # Run frontend tests"

up: ## Start all services
	@echo "$(BLUE)Starting AI Incident Manager services...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) up --build
	@echo "$(GREEN)✓ Services started successfully$(NC)"
	@echo "$(BLUE)Frontend:$(NC) http://localhost:3000"
	@echo "$(BLUE)Backend API:$(NC) http://localhost:8081"
	@echo "$(BLUE)Grafana:$(NC) http://localhost:3001"

up-dev: ## Start in development mode
	@echo "$(BLUE)Starting development environment...$(NC)"
	docker-compose -f docker-compose.yml up --build
	@echo "$(GREEN)✓ Development environment started$(NC)"

up-prod: ## Start in production mode
	@echo "$(BLUE)Starting production environment...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) up --build -d
	@echo "$(GREEN)✓ Production environment started$(NC)"

down: ## Stop all services
	@echo "$(YELLOW)Stopping AI Incident Manager services...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) down
	@echo "$(GREEN)✓ Services stopped$(NC)"

restart: ## Restart all services
	@echo "$(BLUE)Restarting AI Incident Manager services...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) down
	docker-compose -f $(DOCKER_COMPOSE) up --build
	@echo "$(GREEN)✓ Services restarted$(NC)"

logs: ## Show service logs
	@if [ -n "$(SERVICE)" ]; then \
		docker-compose -f $(DOCKER_COMPOSE) logs -f; \
	else \
		docker-compose -f $(DOCKER_COMPOSE) logs $(SERVICE); \
	fi

logs-api: ## Show API logs
	@echo "$(BLUE)Showing API logs...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) logs api

logs-frontend: ## Show frontend logs
	@echo "$(BLUE)Showing frontend logs...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) logs frontend

logs-db: ## Show database logs
	@echo "$(BLUE)Showing database logs...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) logs postgres

logs-ai: ## Show AI service logs
	@echo "$(BLUE)Showing AI service logs...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) logs ollama

logs-grafana: ## Show Grafana logs
	@echo "$(BLUE)Showing Grafana logs...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) logs grafana

logs-all: ## Show all logs
	@echo "$(BLUE)Showing all service logs...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) logs

follow-logs: ## Follow all logs
	@echo "$(BLUE)Following all service logs (Ctrl+C to stop)...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) logs -f

build: ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) build
	@echo "$(GREEN)✓ Build completed$(NC)"

build-no-cache: ## Build without cache
	@echo "$(BLUE)Building Docker images (no cache)...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) build --no-cache
	@echo "$(GREEN)✓ Build completed$(NC)"

build-api: ## Build only API image
	@echo "$(BLUE)Building API image...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) build api
	@echo "$(GREEN)✓ API build completed$(NC)"

build-frontend: ## Build only frontend image
	@echo "$(BLUE)Building frontend image...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) build frontend
	@echo "$(GREEN)✓ Frontend build completed$(NC)"

clean: ## Clean up Docker resources
	@echo "$(YELLOW)Cleaning up Docker resources...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) down -v
	docker system prune -f
	@echo "$(GREEN)✓ Cleanup completed$(NC)"

clean-all: ## Clean everything including volumes
	@echo "$(RED)⚠️  This will remove all Docker volumes and images!$(NC)"
	@read -p "Are you sure? [y/N] " -r CONFIRM; \
		if [ "$$CONFIRM" = "y" ]; then \
			docker-compose -f $(DOCKER_COMPOSE) down -v; \
			docker system prune -a -f; \
			echo "$(GREEN)✓ All Docker resources cleaned$(NC)"; \
		else \
			echo "$(YELLOW)Cleanup cancelled$(NC)"; \
		fi

test: ## Run all tests
	@echo "$(BLUE)Running all tests...$(NC)"
	$(MAKE) test-backend
	$(MAKE) test-frontend
	@echo "$(GREEN)✓ All tests completed$(NC)"

test-backend: ## Run backend tests
	@echo "$(BLUE)Running backend tests...$(NC)"
	cd cmd/server && go test -v ./...
	@echo "$(GREEN)✓ Backend tests completed$(NC)"

test-frontend: ## Run frontend tests
	@echo "$(BLUE)Running frontend tests...$(NC)"
	cd web && npm test
	@echo "$(GREEN)✓ Frontend tests completed$(NC)"

test-watch: ## Run tests in watch mode
	@echo "$(BLUE)Running tests in watch mode...$(NC)"
	$(MAKE) test-backend &
	$(MAKE) test-frontend &
	@echo "$(GREEN)✓ Test watchers started$(NC)"

lint: ## Run all linters
	@echo "$(BLUE)Running linters...$(NC)"
	$(MAKE) lint-backend
	$(MAKE) lint-frontend
	@echo "$(GREEN)✓ Linting completed$(NC)"

lint-backend: ## Run backend linter
	@echo "$(BLUE)Running backend linter...$(NC)"
	golangci-lint run ./...
	@echo "$(GREEN)✓ Backend linting completed$(NC)"

lint-frontend: ## Run frontend linter
	@echo "$(BLUE)Running frontend linter...$(NC)"
	cd web && npm run lint
	@echo "$(GREEN)✓ Frontend linting completed$(NC)"

format: ## Format all code
	@echo "$(BLUE)Formatting code...$(NC)"
	$(MAKE) format-backend
	$(MAKE) format-frontend
	@echo "$(GREEN)✓ Code formatting completed$(NC)"

format-backend: ## Format backend code
	@echo "$(BLUE)Formatting Go code...$(NC)"
	gofmt -s -w .
	@echo "$(GREEN)✓ Backend formatting completed$(NC)"

format-frontend: ## Format frontend code
	@echo "$(BLUE)Formatting frontend code...$(NC)"
	cd web && npm run format
	@echo "$(GREEN)✓ Frontend formatting completed$(NC)"

dev: ## Start development environment
	@echo "$(BLUE)Starting development environment...$(NC)"
	$(MAKE) up-dev

prod: ## Start production environment
	@echo "$(BLUE)Starting production environment...$(NC)"
	$(MAKE) up-prod

status: ## Show service status
	@echo "$(BLUE)Checking service status...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) ps
	@echo "$(GREEN)✓ Status check completed$(NC)"

shell: ## Open shell in running container
	@echo "$(BLUE)Opening shell in API container...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) exec api bash

shell-db: ## Open shell in database container
	@echo "$(BLUE)Opening shell in database container...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) exec postgres psql -U postgres -d incidentdb

shell-ai: ## Open shell in AI service container
	@echo "$(BLUE)Opening shell in AI service container...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) exec ollama bash

shell-grafana: ## Open shell in Grafana container
	@echo "$(BLUE)Opening shell in Grafana container...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) exec grafana bash

migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) exec api go run cmd/server/main.go migrate
	@echo "$(GREEN)✓ Migrations completed$(NC)"

seed: ## Seed database with sample data
	@echo "$(BLUE)Seeding database...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) exec api go run cmd/server/main.go seed
	@echo "$(GREEN)✓ Database seeded$(NC)"

backup: ## Backup database
	@echo "$(BLUE)Creating database backup...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) exec postgres pg_dump -U postgres -d incidentdb > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Backup created: backup_$(shell date +%Y%m%d_%H%M%S).sql$(NC)"

restore: ## Restore database from backup
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: Please specify backup file with FILE=filename.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Restoring database from $(FILE)...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE) exec -T postgres psql -U postgres -d incidentdb < $(FILE)
	@echo "$(GREEN)✓ Database restored from $(FILE)$(NC)"

install: ## Install dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	$(MAKE) install-backend
	$(MAKE) install-frontend
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

install-backend: ## Install backend dependencies
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	go mod download
	go mod tidy
	@echo "$(GREEN)✓ Backend dependencies installed$(NC)"

install-frontend: ## Install frontend dependencies
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	cd web && npm ci
	@echo "$(GREEN)✓ Frontend dependencies installed$(NC)"

update: ## Update dependencies
	@echo "$(BLUE)Updating dependencies...$(NC)"
	$(MAKE) update-backend
	$(MAKE) update-frontend
	@echo "$(GREEN)✓ Dependencies updated$(NC)"

update-backend: ## Update backend dependencies
	@echo "$(BLUE)Updating backend dependencies...$(NC)"
	go get -u ./...
	go mod tidy
	@echo "$(GREEN)✓ Backend dependencies updated$(NC)"

update-frontend: ## Update frontend dependencies
	@echo "$(BLUE)Updating frontend dependencies...$(NC)"
	cd web && npm update
	@echo "$(GREEN)✓ Frontend dependencies updated$(NC)"

check: ## Check environment
	@echo "$(BLUE)Checking environment...$(NC)"
	@echo "$(BLUE)Docker: $(shell docker --version 2>/dev/null)$(NC)"
	@echo "$(BLUE)Docker Compose: $(shell docker-compose --version 2>/dev/null)$(NC)"
	@echo "$(BLUE)Go: $(shell go version 2>/dev/null)$(NC)"
	@echo "$(BLUE)Node.js: $(shell node --version 2>/dev/null)$(NC)"
	@echo "$(GREEN)✓ Environment check completed$(NC)"

info: ## Show project information
	@echo "$(BLUE)AI Incident Manager$(NC)"
	@echo "$(BLUE)Version: $(shell git describe --tags --always --abbrev=0)$(NC)"
	@echo "$(BLUE)Go Version: $(shell go version 2>/dev/null)$(NC)"
	@echo "$(BLUE)Node Version: $(shell node --version 2>/dev/null)$(NC)"
	@echo "$(BLUE)Docker Compose: $(shell docker-compose --version 2>/dev/null)$(NC)"

# Default target
.DEFAULT_GOAL := help
