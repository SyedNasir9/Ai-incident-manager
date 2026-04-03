# 🚀 AI Incident Manager

> **Intelligent incident management platform powered by AI-driven root cause analysis and vector similarity matching**

Transform your incident response from reactive firefighting to proactive, data-driven resolution. AI Incident Manager automatically detects patterns, analyzes root causes, and identifies similar historical incidents to accelerate your MTTR and prevent recurring issues.

---

## 📌 Overview

AI Incident Manager is an enterprise-grade incident management system that leverages artificial intelligence to transform how organizations handle production incidents. By combining real-time observability data with AI-powered analysis, it provides intelligent insights that dramatically reduce mean time to resolution (MTTR) and improve system reliability.

## 🌍 Problem Statement

Modern distributed systems generate thousands of alerts daily, overwhelming incident response teams with:

- **Alert fatigue** from noisy, poorly contextualized notifications
- **Slow incident resolution** due to manual root cause analysis
- **Repeated incidents** because historical knowledge isn't leveraged
- **Fragmented observability** across multiple monitoring tools
- **Knowledge silos** where expertise isn't shared or preserved

Traditional incident management tools focus on workflow rather than intelligence, leaving teams to manually piece together the story of what went wrong.

## 💡 Solution

AI Incident Manager solves these challenges through:

**🧠 AI-Powered Root Cause Analysis**  
Automatically analyzes incident data using local LLMs to suggest probable root causes and contributing factors.

**🔍 Vector-Based Similarity Matching**  
Uses embeddings and cosine similarity to instantly find related historical incidents, surfacing relevant solutions and patterns.

**📊 Unified Observability Dashboard**  
Aggregates data from Prometheus (metrics), Loki (logs), and Kubernetes events into a single intelligent view.

**⚡ Real-Time Intelligence**  
Processes incident data as it happens, providing immediate insights without manual intervention.

**🔒 Privacy-First AI**  
Runs entirely on your infrastructure using Ollama - no external AI services required.

---

## ✨ Key Features

### 🤖 Intelligent Analysis
- **Automated Root Cause Detection** using Ollama LLM integration
- **Vector-based incident similarity search** with pgvector
- **Pattern recognition** across historical incidents
- **Context-aware AI analysis** of logs, metrics, and events

### 📈 Real-Time Monitoring
- **Prometheus metrics integration** for system health monitoring
- **Loki log aggregation** with intelligent filtering
- **Kubernetes events correlation** for container environment insights
- **Grafana dashboard** with custom incident visualizations

### 🛡️ Production-Ready Architecture
- **Comprehensive error handling** with structured logging
- **Rate limiting and validation** for API endpoints
- **Health checks and graceful shutdown** for all services
- **Docker containerization** with optimized multi-stage builds

### 🔗 Integration Ecosystem
- **Slack ChatOps commands** for incident management
- **RESTful API** with comprehensive endpoint coverage
- **WebSocket support** for real-time UI updates
- **Grafana annotation integration** for timeline correlation

### 🌐 Modern User Experience
- **Responsive Next.js frontend** with TypeScript
- **Real-time data synchronization** using React Query
- **Intuitive incident timeline visualization**
- **Mobile-optimized incident response interface**

---

## 🏗️ Architecture

AI Incident Manager follows a microservices architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Next.js React App (Port 3000)                     │   │
│  │  • TypeScript + Tailwind CSS                       │   │
│  │  • React Query for state management                │   │
│  │  • Real-time incident dashboard                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                      HTTP/API                              │
│                           │                                 │
│                    Backend Layer                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Go API Server (Port 8081)                         │   │
│  │  • Gin HTTP framework                              │   │
│  │  • Structured logging with Zap                     │   │
│  │  • JWT authentication & rate limiting              │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                    Data & AI Layer                          │
│  ┌─────────────┬─────────────┬─────────────────────────┐   │
│  │ PostgreSQL  │   Ollama    │   Vector Embeddings     │   │
│  │ (Port 5432) │ (Port 11434)│     (pgvector)         │   │
│  │ • Incidents │ • LLM API   │   • Similarity search   │   │
│  │ • Timelines │ • Embeddings│   • Cosine distance     │   │
│  │ • Analytics │ • Analysis  │   • Pattern matching    │   │
│  └─────────────┴─────────────┴─────────────────────────┘   │
│                           │                                 │
│                Observability Layer                          │
│  ┌─────────────┬─────────────┬─────────────────────────┐   │
│  │ Prometheus  │     Loki     │        Grafana         │   │
│  │ (Port 9090) │ (Port 3100) │      (Port 3001)       │   │
│  │ • Metrics   │ • Log        │    • Dashboards        │   │
│  │ • Alerts    │   Aggregation│    • Visualizations    │   │
│  │ • Monitoring│ • Search     │    • Incident tracking │   │
│  └─────────────┴─────────────┴─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Overview

**Frontend (Next.js)**
- Server-side rendered React application
- Real-time incident dashboard with timeline views
- Mobile-responsive design optimized for incident response
- TypeScript for type safety and developer productivity

**Backend API (Go)**
- High-performance HTTP server using Gin framework
- RESTful endpoints for incident CRUD operations
- Integrated AI analysis pipeline with Ollama
- Comprehensive logging, monitoring, and error handling

**Data Layer (PostgreSQL + pgvector)**
- Relational data storage for incidents, timelines, and metadata
- Vector extension for similarity search and pattern matching
- Optimized indexes for fast query performance
- ACID compliance for data integrity

**AI Engine (Ollama)**
- Local LLM deployment for privacy and control
- Embedding generation for similarity analysis
- Root cause analysis using trained models
- No external dependencies or API costs

**Observability Stack**
- **Prometheus**: Time-series metrics and alerting
- **Loki**: Centralized logging with powerful query capabilities  
- **Grafana**: Rich visualization and incident correlation
- **Promtail**: Log collection and forwarding

---

## 🔄 End-to-End Flow

### 1. Incident Detection
```
Alert/Event → Webhook → Backend API → Database Storage
                                   → AI Analysis Pipeline
```

### 2. AI Analysis Process
```
Incident Data → Text Preprocessing → Ollama Embeddings → Vector Storage
                                  → Root Cause Analysis → Results Cache
```

### 3. Similarity Matching
```
New Incident → Generate Embedding → pgvector Cosine Search → Similar Incidents
                                 → Historical Resolution Data → Recommended Actions
```

### 4. Real-Time Updates
```
Database Changes → WebSocket Events → Frontend Updates → User Notification
                → Grafana Annotations → Dashboard Refresh
```

### 5. User Interaction Flow
```
User Request → Frontend → API Gateway → Service Layer → Database
                       → Authentication → Rate Limiting → Response
```

---

## 🛠️ Tech Stack

### **Backend**
- **Go 1.21+** - High-performance systems programming
- **Gin v1.12** - Lightweight HTTP web framework
- **pgx/v5** - High-performance PostgreSQL driver
- **Viper** - Configuration management with environment variable support
- **Zap** - Structured, leveled logging
- **Kubernetes Client-Go** - Native K8s integration

### **Frontend**
- **Next.js 14** - React framework with SSR and API routes
- **TypeScript** - Type-safe development experience
- **Tailwind CSS** - Utility-first styling framework
- **React Query** - Server state management and caching
- **Axios** - Promise-based HTTP client

### **Data & AI**
- **PostgreSQL 16** - Robust relational database
- **pgvector** - Vector similarity search extension
- **Ollama** - Local LLM inference engine
- **TinyLlama/Llama2** - Open-source language models

### **DevOps & Observability**
- **Docker & Docker Compose** - Container orchestration
- **Prometheus** - Metrics collection and alerting
- **Loki** - Log aggregation and search
- **Grafana** - Visualization and dashboards
- **Promtail** - Log collection agent

### **Development**
- **Make** - Build automation and task runner
- **Air** - Hot reload for Go development
- **ESLint & Prettier** - Code quality and formatting
- **Jest** - JavaScript testing framework

---

## ⚙️ Setup & Installation

### Prerequisites

Ensure you have the following installed:

- **Docker 24.0+** and **Docker Compose v2**
- **Git** for version control
- **Make** (optional, for development commands)

For local development additionally install:
- **Go 1.21+** 
- **Node.js 18+** and **npm**

### Quick Start (Production)

1. **Clone the repository**
   ```bash
   git clone https://github.com/syednasir/ai-incident-manager.git
   cd ai-incident-manager
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration (see Environment Variables section)
   ```

3. **Start the complete stack**
   ```bash
   docker-compose up --build -d
   ```

4. **Verify deployment**
   ```bash
   # Check all services are healthy
   docker-compose ps
   
   # View logs for any troubleshooting
   docker-compose logs -f
   ```

5. **Access the applications**
   - **Frontend Dashboard**: http://localhost:3000
   - **Backend API**: http://localhost:8081
   - **Grafana**: http://localhost:3001 (admin/admin)
   - **Prometheus**: http://localhost:9090

### Development Setup

1. **Start backend dependencies**
   ```bash
   docker-compose up postgres ollama prometheus loki grafana -d
   ```

2. **Run backend locally**
   ```bash
   go mod tidy
   go run cmd/server/main.go
   ```

3. **Run frontend locally**
   ```bash
   cd web
   npm install
   cp .env.example .env.local
   # Edit .env.local with NEXT_PUBLIC_API_URL=http://localhost:8081
   npm run dev
   ```

---

## 🔐 Environment Variables

### Database Configuration
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | PostgreSQL host | `localhost` | ✅ |
| `DB_PORT` | PostgreSQL port | `5432` | ✅ |
| `DB_USER` | Database username | `postgres` | ✅ |
| `DB_PASSWORD` | Database password | `postgres` | ✅ |
| `DB_NAME` | Database name | `incidentdb` | ✅ |
| `DB_SSLMODE` | SSL mode | `disable` | ✅ |

### AI Services
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OLLAMA_URL` | Ollama service URL | `http://localhost:11434` | ✅ |
| `OLLAMA_MODEL` | LLM model name | `tinyllama` | ✅ |

### Observability
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PROMETHEUS_URL` | Prometheus endpoint | `http://localhost:9090` | ✅ |
| `LOKI_URL` | Loki endpoint | `http://localhost:3100` | ✅ |
| `GRAFANA_URL` | Grafana endpoint | `http://localhost:3001` | ❌ |
| `GRAFANA_API_KEY` | Grafana API key | - | ❌ |

### Application
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SERVER_PORT` | Backend API port | `8081` | ✅ |
| `GIN_MODE` | Gin framework mode | `release` | ✅ |
| `LOG_LEVEL` | Logging level | `info` | ✅ |
| `NEXT_PUBLIC_API_URL` | Frontend API URL | `/api/backend` | ✅ |

---

## 📦 Running the Project

### Production Deployment
```bash
# Start all services in background
docker-compose -f docker-compose.yml up -d --build

# View service status
docker-compose ps

# Follow logs for all services
docker-compose logs -f

# Scale specific services
docker-compose up --scale api=2 -d
```

### Development Mode
```bash
# Start with file watching for hot reload
docker-compose up --build --watch

# Run only data layer for local development
make dev-deps

# Run backend tests
make test

# Run frontend in development mode
cd web && npm run dev
```

### Health Checks
```bash
# Backend API health
curl http://localhost:8081/health

# Frontend availability
curl http://localhost:3000

# Grafana dashboard
curl http://localhost:3001/api/health

# Prometheus metrics
curl http://localhost:9090/-/healthy
```

---

## 🧪 Testing

### Backend Tests
```bash
# Run all Go tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run specific package tests
go test ./internal/similarity/...

# Run integration tests
make test-integration
```

### Frontend Tests
```bash
cd web

# Run Jest tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Load Testing
```bash
# API load testing with k6
k6 run scripts/load-test.js

# Database performance testing
make bench-db
```

---

## 🚧 Architecture Decisions & Trade-offs

### Why Go for Backend?
- **Performance**: Handles concurrent requests efficiently with goroutines
- **Simplicity**: Minimal dependencies and clear error handling
- **Observability**: Excellent tooling for metrics, tracing, and profiling
- **Docker Integration**: Produces small, secure container images

### Why Ollama vs Cloud AI?
- **Privacy**: Sensitive incident data stays within your infrastructure
- **Cost Control**: No per-request API charges for AI analysis
- **Latency**: Local inference eliminates network round-trips
- **Reliability**: No dependency on external service availability

### Why pgvector vs Vector Database?
- **Simplicity**: Single database for both relational and vector data
- **ACID Compliance**: Strong consistency for critical incident data
- **Operational Overhead**: Fewer services to monitor and maintain
- **Query Flexibility**: SQL joins between incident metadata and vectors

### Why Next.js vs SPA?
- **SEO**: Server-side rendering for better discoverability
- **Performance**: Automatic code splitting and optimization
- **Developer Experience**: Excellent TypeScript integration
- **API Routes**: Backend functionality without separate service

---

## 🔮 Future Roadmap

### Short Term (1-3 months)
- **Multi-Model Support**: Integration with GPT, Claude, and Anthropic APIs
- **Advanced Analytics**: Incident trend analysis and MTTR metrics
- **Mobile App**: Native iOS/Android applications for on-call engineers
- **Slack Integration**: Rich interactive notifications and incident management
- **API Rate Limiting**: Enhanced throttling and quota management

### Medium Term (3-6 months)
- **Machine Learning Pipeline**: Custom model training on historical incidents
- **Automated Remediation**: AI-suggested resolution actions with approval workflow
- **Multi-Tenant Architecture**: Organization and team isolation
- **Integration Hub**: Connectors for DataDog, New Relic, PagerDuty
- **Advanced RBAC**: Role-based access control with fine-grained permissions

### Long Term (6-12 months)
- **Predictive Analytics**: Incident forecasting and prevention
- **Custom Dashboard Builder**: Drag-and-drop interface for metrics visualization
- **Compliance Reporting**: SOC2, PCI-DSS incident reporting automation
- **Global Deployment**: Multi-region incident correlation and management
- **AI Model Marketplace**: Community-driven incident analysis models

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Workflow

1. **Fork the repository** and create a feature branch
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

2. **Make your changes** with comprehensive tests
   ```bash
   # Ensure all tests pass
   make test
   cd web && npm test
   ```

3. **Follow code quality standards**
   ```bash
   # Format Go code
   go fmt ./...
   
   # Format TypeScript code
   cd web && npm run format
   
   # Run linters
   make lint
   ```

4. **Submit a pull request** with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots for UI changes
   - Performance impact assessment

### Code Standards
- **Go**: Follow standard Go conventions and run `go fmt`
- **TypeScript**: Use ESLint and Prettier configurations
- **Commits**: Use conventional commit format
- **Documentation**: Update relevant docs with your changes

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[PostgreSQL](https://postgresql.org/)** - The world's most advanced open source database
- **[pgvector](https://github.com/pgvector/pgvector)** - Vector similarity search for PostgreSQL  
- **[Ollama](https://ollama.ai/)** - Local LLM inference made simple
- **[Gin](https://gin-gonic.com/)** - High-performance HTTP web framework for Go
- **[Next.js](https://nextjs.org/)** - The React framework for production
- **[Grafana](https://grafana.com/)** - Open source analytics & monitoring solution
- **[Prometheus](https://prometheus.io/)** - Cloud native monitoring solution

---

<div align="center">

**Built with ❤️ for intelligent incident management**

[Documentation](./docs/) • [API Reference](./docs/api/) • [Deployment Guide](./DEPLOYMENT.md) • [Contributing](./CONTRIBUTING.md)

</div>
