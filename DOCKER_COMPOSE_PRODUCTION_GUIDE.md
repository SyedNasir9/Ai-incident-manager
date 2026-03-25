# Production Docker Compose Setup Guide

## 🎯 **OVERVIEW**

Production-ready Docker Compose configuration for AI Incident Manager with complete service networking, proper dependencies, and persistent data storage.

## 📋 **SERVICES CONFIGURED**

### ✅ **Core Services**
1. **Backend (Go API)** - Port 8081
2. **Frontend (Next.js)** - Port 3000  
3. **PostgreSQL** - Port 5432 with pgvector extension
4. **Ollama AI** - Port 11434 for embeddings
5. **Grafana** - Port 3001 for visualization
6. **Prometheus** - Port 9090 for metrics
7. **Loki** - Port 3100 for logs

### ✅ **Networking**
- **Docker Network**: `ai-incident-network` (172.20.0.0/16)
- **Service Communication**: All services use Docker DNS names (no localhost)
- **Port Exposure**: Only external-facing ports exposed

### ✅ **Data Persistence**
- **PostgreSQL**: `/var/lib/postgresql/data`
- **Ollama**: `/root/.ollama` (model storage)
- **Prometheus**: `/prometheus` (metrics storage)
- **Loki**: `/var/lib/loki` (log storage)
- **Grafana**: `/var/lib/grafana` (dashboard storage)

## 🚀 **QUICK START**

### **Prerequisites**
```bash
# Docker and Docker Compose
docker --version
docker-compose --version

# Environment file (copy and customize)
cp .env.example .env
```

### **One-Command Startup**
```bash
# Start entire stack
docker-compose -f docker-compose.production.yml up --build

# Start in background
docker-compose -f docker-compose.production.yml up -d --build

# Stop all services
docker-compose -f docker-compose.production.yml down

# View logs
docker-compose -f docker-compose.production.yml logs -f backend
```

## 🔧 **ENVIRONMENT CONFIGURATION**

### **Required Environment Variables**
```bash
# Database
POSTGRES_PASSWORD=your_secure_password

# AI Services
OLLAMA_MODELS=tinyllama,llama2

# Security
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
API_RATE_LIMIT=100

# Logging
LOG_LEVEL=info

# Grafana
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=your_admin_password
GRAFANA_DOMAIN=your-domain.com
GRAFANA_LOG_LEVEL=info
```

### **Optional Environment Variables**
```bash
# Default values provided if not set
POSTGRES_PASSWORD=postgres
OLLAMA_MODELS=tinyllama
CORS_ORIGINS=http://localhost:3000
API_RATE_LIMIT=100
LOG_LEVEL=info
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
GRAFANA_DOMAIN=localhost
GRAFANA_LOG_LEVEL=info
GRAFANA_API_KEY=
```

## 🌐 **SERVICE ACCESS**

### **Application URLs**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081
- **Backend Health**: http://localhost:8081/health
- **Embeddings API**: http://localhost:8081/api/embeddings

### **Observability URLs**
- **Grafana Dashboard**: http://localhost:3001
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100

### **Database Access**
- **Host**: localhost
- **Port**: 5432
- **Database**: incidentdb
- **User**: postgres

## 🏥️ **HEALTH CHECKS**

### **Service Health Endpoints**
```bash
# Backend health
curl http://localhost:8081/health

# Frontend health
curl http://localhost:3000

# Grafana health
curl http://localhost:3001/api/health

# PostgreSQL health
docker exec ai-incident-postgres pg_isready -U postgres -d incidentdb

# Ollama health
curl http://localhost:11434/api/tags

# Prometheus health
curl http://localhost:9090/-/healthy

# Loki health
curl http://localhost:3100/ready
```

### **Health Check Results**
- ✅ **Healthy**: Service ready to accept traffic
- ❌ **Unhealthy**: Service needs attention
- 🔄 **Starting**: Service initializing

## 📊 **RESOURCE MANAGEMENT**

### **Memory Allocation**
```yaml
# Production-ready resource limits
deploy:
  resources:
    limits:
      memory: 512M      # Backend API
      cpus: '0.5'
    reservations:
      memory: 256M      # Minimum guaranteed
      cpus: '0.25'
```

### **Service Dependencies**
```yaml
depends_on:
  postgres:
    condition: service_healthy
  ollama:
    condition: service_healthy
```

## 🔒 **SECURITY FEATURES**

### **Network Isolation**
- **Bridge Network**: Services isolated from host network
- **Internal Communication**: Services communicate via Docker DNS names
- **Port Mapping**: Only necessary ports exposed to host

### **Authentication**
```yaml
# Grafana admin access
GF_SECURITY_ADMIN_USER: admin
GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD}
GF_USERS_ALLOW_SIGN_UP: "false"
```

### **CORS Configuration**
```bash
# Frontend origins allowed
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
```

## 📈 **MONITORING & LOGGING**

### **Structured Logging**
- **Backend**: Zap logger with configurable levels
- **Prometheus**: Metrics collection with 30-day retention
- **Loki**: Log aggregation with JSON parsing

### **Health Check Intervals**
- **Backend**: 30s interval, 10s timeout, 5 retries
- **Database**: 10s interval, 5s timeout, 5 retries
- **AI Services**: 30s interval, 10s timeout, 3 retries
- **Observability**: 30s interval, 10s timeout, 3 retries

## 🎛️ **PRODUCTION TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **Service Won't Start**
```bash
# Check port conflicts
netstat -tulpn | grep :8081
netstat -tulpn | grep :3000

# Check Docker logs
docker-compose -f docker-compose.production.yml logs backend

# Clean rebuild
docker-compose -f docker-compose.production.yml down
docker system prune -f
docker-compose -f docker-compose.production.yml up --build
```

#### **Database Connection Issues**
```bash
# Check PostgreSQL logs
docker-compose -f docker-compose.production.yml logs postgres

# Test database connection
docker exec ai-incident-postgres psql -U postgres -d incidentdb -c "SELECT 1;"

# Reset database volume (CAUTION: deletes data)
docker volume rm ai-incident-manager_postgres_data
```

#### **AI Service Issues**
```bash
# Check Ollama status
docker-compose -f docker-compose.production.yml logs ollama

# Test Ollama API
curl http://localhost:11434/api/tags

# Pull models manually
docker exec ai-incident-ollama ollama pull tinyllama
```

#### **Frontend Build Issues**
```bash
# Clear Next.js cache
docker-compose -f docker-compose.production.yml exec frontend npm run build:clean

# Rebuild without cache
docker-compose -f docker-compose.production.yml build --no-cache frontend
```

## 🔄 **DEPLOYMENT WORKFLOWS**

### **Development Workflow**
```bash
# 1. Start development stack
docker-compose -f docker-compose.production.yml up --build

# 2. Monitor startup
docker-compose -f docker-compose.production.yml logs -f

# 3. Access services
open http://localhost:3000  # Frontend
open http://localhost:3001  # Grafana
```

### **Production Workflow**
```bash
# 1. Set production environment
export NODE_ENV=production
export LOG_LEVEL=warn
export POSTGRES_PASSWORD=your_production_password

# 2. Start with production overrides
docker-compose -f docker-compose.production.yml up --build

# 3. Verify health
curl -f http://localhost:8081/health
curl -f http://localhost:3000/api/health
```

### **Backup Workflow**
```bash
# Backup volumes
docker run --rm -v ai-incident-manager_postgres_data:/data -v $(pwd)/backup:/backup postgres:16-alpine tar czf /backup/postgres-backup-$(date +%Y%m%d).tar.gz -C /data .

# Backup Grafana configuration
docker run --rm -v ai-incident-manager_grafana_data:/grafana -v $(pwd)/backup:/backup postgres:16-alpine tar czf /backup/grafana-backup-$(date +%Y%m%d).tar.gz -C /grafana .
```

## 📋 **PRODUCTION CHECKLIST**

### **Pre-Deployment Checklist**
- [ ] Environment variables configured in `.env`
- [ ] Database password set to strong value
- [ ] Grafana admin credentials updated
- [ ] CORS origins configured for production domain
- [ ] SSL certificates configured (if using HTTPS)
- [ ] Resource limits appropriate for server specs
- [ ] Backup strategy implemented
- [ ] Log rotation configured
- [ ] Monitoring alerts configured

### **Post-Deployment Verification**
- [ ] All services healthy: `docker-compose ps`
- [ ] Frontend accessible: `curl http://localhost:3000`
- [ ] Backend API responsive: `curl http://localhost:8081/health`
- [ ] Database connected: Check application logs
- [ ] Grafana dashboards loading: Access web UI
- [ ] Metrics collecting: Check Prometheus targets
- [ ] Logs aggregating: Check Loki sources

## 🎯 **PERFORMANCE OPTIMIZATION**

### **Database Optimization**
```yaml
# PostgreSQL configuration
POSTGRES_SHARED_PRELOAD_LIBRARIES: vector
POSTGRES_MAINTENANCE_WORK_MEM: 128MB
POSTGRES_EFFECTIVE_CACHE_SIZE: 256MB
```

### **Application Optimization**
```yaml
# Backend resource limits
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'

# Environment variables
GOMAXPROCS: 1
GOGC: 100
```

---

## 🚀 **QUICK COMMANDS**

### **Essential Commands**
```bash
# Start everything
docker-compose -f docker-compose.production.yml up --build -d

# Stop everything
docker-compose -f docker-compose.production.yml down

# View logs
docker-compose -f docker-compose.production.yml logs

# Rebuild specific service
docker-compose -f docker-compose.production.yml up --build backend

# Scale services (if needed)
docker-compose -f docker-compose.production.yml up --scale backend=2

# Clean up unused resources
docker system prune -f
docker volume prune -f
```

---

## 📈 **MONITORING DASHBOARDS**

### **Key Grafana Dashboards**
1. **Incident Overview**: Real-time incident status and metrics
2. **System Health**: Service health and resource utilization
3. **Performance Metrics**: API response times and error rates
4. **Log Analysis**: Error patterns and system events

### **Alerting Configuration**
- **Service Health**: Alert on service downtime
- **High Error Rates**: Alert on API errors > 5%
- **Resource Usage**: Alert on CPU > 80%, Memory > 85%
- **Database Performance**: Alert on slow queries > 1s

---

**Status**: ✅ **PRODUCTION-READY**  
**Services**: 7 fully configured with networking  
**Security**: 🔒 **Enterprise-grade security features**  
**Monitoring**: 📊 **Comprehensive observability stack**  

The production Docker Compose configuration provides a complete, scalable, and secure deployment setup for the AI Incident Manager system.
