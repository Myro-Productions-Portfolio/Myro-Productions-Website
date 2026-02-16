# Deployment Guide

Complete guide for deploying the Myro Productions website to production.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Docker Deployment](#docker-deployment)
- [Cloudflare Tunnel Setup](#cloudflare-tunnel-setup)
- [Database Migration](#database-migration)
- [Health Checks](#health-checks)
- [Rollback Procedure](#rollback-procedure)
- [Troubleshooting](#troubleshooting)

## Overview

The application is deployed using:
- **Docker** containers for application isolation
- **Cloudflare Tunnel** for secure public access without port forwarding
- **PostgreSQL** database in separate container
- **Self-hosted** on Mac Mini M4 (nicolasmac) at 10.0.0.223

### Deployment Architecture

```
┌──────────────┐
│  Developer   │
│   Machine    │
└──────┬───────┘
       │ Git push
       ▼
┌──────────────┐
│    Gitea     │ (10.0.0.223:3000)
│  Repository  │
└──────┬───────┘
       │ Git pull
       ▼
┌────────────────────────────────────────┐
│    Docker Host (nicolasmac)            │
│                                        │
│  ┌─────────────┐  ┌─────────────┐    │
│  │  Build      │  │   Deploy    │    │
│  │  Docker     │─▶│  Container  │    │
│  │  Image      │  │             │    │
│  └─────────────┘  └─────────────┘    │
│                                        │
│  ┌─────────────┐  ┌─────────────┐    │
│  │ cloudflared │  │ PostgreSQL  │    │
│  │   Tunnel    │  │  Database   │    │
│  └─────────────┘  └─────────────┘    │
└────────────────────────────────────────┘
       │
       │ Encrypted tunnel
       ▼
┌──────────────┐
│  Cloudflare  │
│     Edge     │
└──────────────┘
       │
       ▼
┌──────────────┐
│   Internet   │
│    Users     │
└──────────────┘
```

## Prerequisites

### On Development Machine

- Git access to repository
- SSH access to Docker host (nicolasmac)
- Docker knowledge for build commands

### On Docker Host (nicolasmac at 10.0.0.223)

- Docker and Docker Compose installed
- Git installed
- Cloudflare Tunnel configured
- PostgreSQL container running
- Sufficient disk space (~2GB for images)

### External Services

- Cloudflare account with domain configured
- Cloudflare Tunnel set up
- Stripe account for payment processing
- Database backup solution

## Environment Setup

### 1. Environment Variables

Create `.env.production` file on Docker host:

```bash
# Database
DATABASE_URL="postgresql://user:password@postgres:5432/myro_productions?schema=public"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-at-least-32-bytes-long"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Application
NEXT_PUBLIC_SITE_URL="https://myroproductions.com"
NODE_ENV="production"

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="..."
```

### 2. Secure Environment File

```bash
# Set proper permissions
chmod 600 .env.production

# Verify file is not in git
cat .gitignore | grep .env
```

### 3. Build Arguments

For client-side environment variables (baked into bundle):

```bash
NEXT_PUBLIC_SITE_URL="https://myroproductions.com"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

## Docker Deployment

### Manual Deployment

#### Step 1: SSH to Docker Host

```bash
# From development machine
ssh mini2

# Or with full address
ssh myro_productions@10.0.0.223
```

#### Step 2: Navigate to Project

```bash
cd /path/to/myro-productions-website
```

#### Step 3: Pull Latest Code

```bash
# Pull from Gitea
git pull origin main

# Or pull from GitHub
git pull github main
```

#### Step 4: Build Docker Image

```bash
# Build for ARM64 (Apple Silicon)
docker build \
  --platform linux/arm64 \
  --build-arg NEXT_PUBLIC_SITE_URL=https://myroproductions.com \
  --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... \
  -t myro-productions-website:$(git rev-parse --short HEAD) \
  -t myro-productions-website:latest \
  .

# This will take 3-5 minutes for initial build
# Subsequent builds use layer caching and are faster
```

#### Step 5: Stop Old Container

```bash
# Stop and remove old container
docker stop myro-website
docker rm myro-website
```

#### Step 6: Run New Container

```bash
docker run -d \
  --name myro-website \
  --network app-network \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  myro-productions-website:latest
```

#### Step 7: Verify Deployment

```bash
# Check container is running
docker ps | grep myro-website

# Check logs
docker logs -f myro-website

# Health check
curl http://localhost:3000/api/health
```

### Docker Compose Deployment

Alternative approach using Docker Compose:

#### docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
    image: myro-productions-website:latest
    container_name: myro-website
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
      - NODE_ENV=production
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - app-network

  postgres:
    image: postgres:14-alpine
    container_name: postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: myro_productions
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - app-network

  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflare-tunnel
    command: tunnel --no-autoupdate run --token ${CLOUDFLARE_TUNNEL_TOKEN}
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres-data:

networks:
  app-network:
    driver: bridge
```

#### Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f web

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Cloudflare Tunnel Setup

### Initial Setup (One-Time)

#### 1. Install cloudflared

```bash
# On Docker host
docker pull cloudflare/cloudflared:latest
```

#### 2. Login to Cloudflare

Via web dashboard:
1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to Access > Tunnels
3. Click "Create a tunnel"
4. Choose "Cloudflared" connector
5. Name your tunnel: `myro-homelab-tunnel`
6. Copy the tunnel token

#### 3. Configure Tunnel

In Cloudflare dashboard:

1. **Public Hostname**:
   - Subdomain: `(empty for root)` or `www`
   - Domain: `myroproductions.com`
   - Service: `http://myro-website:3000`

2. **Add Another** for www redirect:
   - Subdomain: `www`
   - Domain: `myroproductions.com`
   - Service: `http://myro-website:3000`

#### 4. Start Tunnel

```bash
docker run -d \
  --name cloudflare-tunnel \
  --network app-network \
  --restart unless-stopped \
  cloudflare/cloudflared:latest \
  tunnel --no-autoupdate run --token YOUR_TUNNEL_TOKEN
```

### Verify Tunnel

```bash
# Check tunnel logs
docker logs cloudflare-tunnel

# Should see:
# "Registered tunnel connection"
# "Serving tunnel"

# Test from outside network
curl -I https://myroproductions.com
```

### DNS Configuration

Cloudflare automatically creates CNAME records:

```
myroproductions.com -> myro-homelab-tunnel.cfargotunnel.com
www.myroproductions.com -> myro-homelab-tunnel.cfargotunnel.com
```

Verify DNS:
```bash
dig myroproductions.com
```

## Database Migration

### Run Migrations on Deployment

After deploying new code with schema changes:

```bash
# SSH to Docker host
ssh mini2

# Navigate to project
cd /path/to/myro-productions-website

# Run migrations
docker exec -it myro-website npx prisma migrate deploy

# Or if running via compose
docker-compose exec web npx prisma migrate deploy
```

### Creating New Migrations (Development)

On development machine:

```bash
# Make schema changes in prisma/schema.prisma

# Create migration
npm run db:migrate -- --name add_new_field

# Migration files created in prisma/migrations/

# Commit migration files
git add prisma/migrations/
git commit -m "Add database migration for new field"
```

### Database Backup Before Migration

```bash
# Backup before migration
docker exec postgres pg_dump -U user myro_productions > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore if needed
docker exec -i postgres psql -U user myro_productions < backup-20260216-120000.sql
```

## Health Checks

### Application Health Check

Implement health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }, { status: 200 });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: 'Database connection failed',
    }, { status: 503 });
  }
}
```

### Docker Health Check

Add to docker-compose.yml:

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Monitoring

```bash
# Check container health
docker ps
# Look for "healthy" status

# Continuous monitoring
watch -n 5 'docker ps && curl -s http://localhost:3000/api/health | jq'
```

## Rollback Procedure

### Quick Rollback (Previous Image)

If deployment fails, rollback to previous version:

```bash
# Stop failed container
docker stop myro-website
docker rm myro-website

# List previous images
docker images myro-productions-website

# Start previous version
docker run -d \
  --name myro-website \
  --network app-network \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  myro-productions-website:PREVIOUS_COMMIT_HASH

# Verify
docker logs -f myro-website
curl http://localhost:3000/api/health
```

### Database Rollback

If migration caused issues:

```bash
# Restore from backup
docker exec -i postgres psql -U user myro_productions < backup-20260216-120000.sql

# Or use Prisma migration rollback (if applicable)
docker exec -it myro-website npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs myro-website

# Common issues:
# - Environment variables missing
# - Database connection failed
# - Port already in use

# Check if port is available
lsof -i :3000

# Check environment variables
docker exec myro-website env | grep DATABASE_URL
```

### Database Connection Issues

```bash
# Test database connectivity
docker exec postgres psql -U user -d myro_productions -c "SELECT 1;"

# Check if containers are on same network
docker network inspect app-network

# Verify DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:password@postgres:5432/myro_productions
```

### Cloudflare Tunnel Not Working

```bash
# Check tunnel logs
docker logs cloudflare-tunnel

# Restart tunnel
docker restart cloudflare-tunnel

# Test local access (should work)
curl http://localhost:3000

# Test external access (requires tunnel)
curl https://myroproductions.com
```

### Build Failures

```bash
# Clear Docker cache and rebuild
docker system prune -a
docker build --no-cache -t myro-productions-website:latest .

# Check disk space
df -h

# Check for file permission issues
ls -la /path/to/project
```

### High Memory Usage

```bash
# Check container resource usage
docker stats myro-website

# Limit container resources
docker update --memory="1g" --memory-swap="1g" myro-website
```

### Stripe Webhooks Not Working

```bash
# Verify webhook secret
echo $STRIPE_WEBHOOK_SECRET

# Check webhook endpoint is accessible
curl -X POST https://myroproductions.com/api/webhooks/stripe

# Test with Stripe CLI
stripe listen --forward-to https://myroproductions.com/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

## Continuous Deployment (Future)

### GitHub Actions Workflow (Optional)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: |
          docker build \
            --build-arg NEXT_PUBLIC_SITE_URL=${{ secrets.SITE_URL }} \
            --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${{ secrets.STRIPE_PK }} \
            -t myro-productions-website:${{ github.sha }} \
            -t myro-productions-website:latest \
            .

      - name: Deploy
        run: |
          docker stop myro-website || true
          docker rm myro-website || true
          docker run -d \
            --name myro-website \
            --network app-network \
            -p 3000:3000 \
            --env-file .env.production \
            --restart unless-stopped \
            myro-productions-website:latest

      - name: Health Check
        run: |
          sleep 10
          curl -f http://localhost:3000/api/health || exit 1
```

## Deployment Checklist

Before deploying to production:

- [ ] Code reviewed and tested locally
- [ ] All tests passing (`npm run test && npm run test:e2e`)
- [ ] Environment variables updated (if needed)
- [ ] Database backup created
- [ ] Migration SQL reviewed (if schema changes)
- [ ] Cloudflare tunnel verified as running
- [ ] Previous Docker image tagged for rollback
- [ ] Health check endpoint accessible
- [ ] Monitoring alerts configured

After deployment:

- [ ] Container started successfully
- [ ] Health check passes
- [ ] Website accessible via public URL
- [ ] Admin dashboard accessible and functional
- [ ] Stripe webhooks receiving events
- [ ] Database queries performing well
- [ ] No errors in logs
- [ ] Analytics tracking working

---

For questions or issues, refer to [Troubleshooting](#troubleshooting) or check the [Architecture Documentation](./ARCHITECTURE.md).
