# AI Incident Manager

> An intelligent incident management system that automatically detects, analyzes, and resolves infrastructure incidents using AI-powered root cause analysis and similarity matching.

## 🚀 Features

- **🤖 AI-Powered Analysis**: Automatic root cause detection using Ollama
- **📊 Real-time Monitoring**: Integration with Prometheus metrics and Loki logs
- **🔍 Similarity Engine**: Vector-based incident similarity matching
- **📈 Interactive Dashboard**: Grafana visualization with custom dashboards
- **🛡️ Production Safety**: Comprehensive validation, rate limiting, and error handling
- **🐳 Container-Native**: Full Docker Compose deployment with service orchestration
- **📱 Modern UI**: Responsive Next.js frontend with real-time updates
- **🔗 API Integration**: RESTful APIs with comprehensive incident management

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 Frontend (Next.js)                  │
│                     │                               │
│                 ↓ API Calls                        │
│                     │                               │
│              Backend (Go Gin)                   │
│                     │                               │
│    ┌────────────┬────────────┬────────────┐    │
│    │ PostgreSQL │   Ollama AI │    │
│    │ (pgvector) │   (Embeddings) │    │
│    └────────────┴────────────┴────────────┘    │
│                     │                               │
│              Observability Stack                  │
│    ┌────────────┬────────────┬────────────┐    │
│    │ Prometheus │     Loki      │    │
│    │ (Metrics)  │   (Logs)     │    │
│    └────────────┴────────────┴────────────┘    │
│                     │                               │
│                 Grafana Dashboard                │
│              (Visualization)                   │
└─────────────────────────────────────────────────────┘
```

### Core Components

- **Backend API**: Go service with Gin framework
- **Frontend UI**: Next.js React application
- **Database**: PostgreSQL with pgvector extension for embeddings
- **AI Service**: Ollama integration for embeddings and analysis
- **Observability**: Prometheus metrics + Loki logs + Grafana visualization
- **Container Orchestration**: Docker Compose with service networking

## 🛠️ Tech Stack

### Backend
- **Go 1.25.4** - Core programming language
- **Gin v1.12.0** - HTTP web framework
- **pgx/v5 v5.8.0** - PostgreSQL driver
- **Viper v1.21.0** - Configuration management
- **Zap v1.27.1** - Structured logging

### Frontend
- **Next.js 14.2.35** - React framework
- **React 18** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **React Query** - Server state management

### Infrastructure
- **PostgreSQL 16** - Database with pgvector extension
- **Ollama** - Local LLM for embeddings and analysis
- **Docker & Docker Compose** - Container orchestration
- **Prometheus** - Metrics collection
- **Loki** - Log aggregation
- **Grafana** - Visualization and dashboards

## 🚀 Getting Started

### Prerequisites

- **Docker & Docker Compose** installed and running
- **Git** for version control
- **Go 1.25+** (for local development)
- **Node.js 18+** (for frontend development)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/syednasir/ai-incident-manager.git
cd ai-incident-manager

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your configuration (see .env.example for reference)

# 3. Start the complete stack
docker-compose -f docker-compose.production.yml up --build

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8081
# Grafana Dashboard: http://localhost:3001
```

### Development Mode

```bash
# Start only backend
go run cmd/server/main.go

# Start only frontend
cd web && npm run dev

# Start with hot reload
docker-compose -f docker-compose.production.yml up --build --watch
```

## 📡 API Endpoints

### Core Incident Management

| Method | Endpoint | Description |
|---------|-----------|-------------|
| `GET` | `/incidents` | List all incidents with pagination |
| `GET` | `/incidents/:id` | Get incident details |
| `GET` | `/incidents/:id/timeline` | Get incident timeline |
| `GET` | `/incidents/:id/root-cause` | Get root cause analysis |
| `GET` | `/incidents/:id/similar` | Find similar incidents |
| `POST` | `/api/embeddings` | Generate embeddings for text |

### Observability & Monitoring

| Method | Endpoint | Description |
|---------|-----------|-------------|
| `GET` | `/health` | Application health check |
| `GET` | `/metrics` | Prometheus metrics endpoint |
| `GET` | `/logs` | Loki log aggregation |

### System Integration

| Service | Endpoint | Description |
|---------|-----------|-------------|
| `POST` | `/slack/commands` | Slack ChatOps integration |
| `POST` | `/alerts` | Alertmanager webhook handler |

## 🖼️ Screenshots

*Note: Screenshots would be added here to showcase the UI and functionality*

## 🔮 Future Improvements

### Short Term
- [ ] **Multi-Model Support**: Support for multiple AI models (GPT, Claude, etc.)
- [ ] **Advanced Filtering**: Enhanced incident filtering and search capabilities
- [ ] **Real-time Updates**: WebSocket integration for live incident updates
- [ ] **Mobile App**: Native mobile application for incident management
- [ ] **SLA Tracking**: Service level agreement monitoring and reporting

### Long Term
- [ ] **Machine Learning**: Custom model training for organization-specific patterns
- [ ] **Integration Hub**: Connect with external monitoring systems (DataDog, New Relic)
- [ ] **Automated Remediation**: Suggested resolution actions based on historical data
- [ ] **Multi-tenant Support**: Organization and tenant isolation
- [ ] **Advanced Analytics**: Predictive incident analysis and trend detection

## 📄 Documentation

- **[API Documentation](./docs/api/)**: Detailed API endpoint documentation
- **[Deployment Guide](./DEPLOYMENT.md)**: Production deployment instructions
- **[Docker Guide](./DOCKER_COMPOSE_PRODUCTION_GUIDE.md)**: Container setup guide
- **[Development Guide](./QUICK_START.md)**: Local development setup

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with comprehensive tests
4. Ensure all tests pass (`go test ./...` and `npm test`)
5. Submit a pull request with clear description

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **PostgreSQL & pgvector** - Vector similarity search capabilities
- **Ollama** - Local LLM integration for AI analysis
- **Gin** - High-performance HTTP framework for Go
- **Next.js** - React framework for production-grade applications
- **Grafana & Prometheus** - Industry-standard observability stack
- **Docker** - Container platform for consistent deployments

---

**Built with ❤️ for intelligent incident management**
