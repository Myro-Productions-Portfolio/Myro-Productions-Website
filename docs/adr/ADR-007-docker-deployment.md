# ADR-007: Docker Deployment Strategy

## Status
Accepted

## Context
The application requires a reliable, reproducible deployment strategy that:
- Ensures consistency across development, staging, and production environments
- Minimizes deployment friction and human error
- Supports running on self-hosted infrastructure (homelab)
- Enables easy rollbacks and version management
- Optimizes build times and image sizes
- Integrates with existing container orchestration

The infrastructure includes:
- Mac Mini M4 (nicolasmac) at 10.0.0.223 as Docker host
- PostgreSQL database in a separate container
- Cloudflare Tunnel for secure public access
- Multiple other services in containerized environment

## Decision
Implement a multi-stage Docker build strategy with Next.js standalone output mode for production deployments.

Implementation includes:
- Multi-stage Dockerfile with separate build and runtime stages
- Next.js standalone output mode for minimal image size
- Node.js 20 Alpine Linux for small base image
- Non-root user for security
- Layer caching optimization for fast rebuilds
- .dockerignore for excluding unnecessary files
- Environment variable management for build and runtime

## Consequences

### Positive
- **Reproducibility**: Identical environments across all deployment targets
- **Isolation**: Application runs in isolated container with minimal dependencies
- **Size Optimization**: Multi-stage build produces ~150MB final image (vs 1GB+ naive approach)
- **Security**: Non-root user reduces attack surface
- **Fast Rebuilds**: Layer caching speeds up subsequent builds
- **Version Control**: Docker images are immutable and versioned
- **Easy Rollback**: Can quickly revert to previous image version
- **Development Parity**: Developers can run production-like environment locally
- **Resource Efficiency**: Standalone mode eliminates unnecessary files from runtime

### Negative
- **Build Complexity**: Multi-stage builds require understanding Docker layering
- **Build Time**: Initial builds take several minutes
- **Storage Requirements**: Docker images consume disk space on host
- **Memory Overhead**: Container adds small memory overhead vs native process
- **Debugging Difficulty**: Debugging inside containers more complex than native
- **Platform Dependencies**: Must build for correct architecture (ARM64 for M4)

### Neutral
- **Docker Expertise Required**: Team must understand Docker concepts
- **Build Tools**: Requires Docker installed in CI/CD environment
- **Image Registry**: May need private registry for sensitive configurations
- **Health Checks**: Must implement proper health check endpoints

## Alternatives Considered

### 1. Native Node.js Deployment
**Why Not Chosen**:
- Manual dependency installation on each server
- Environment inconsistencies between deployments
- Difficult to ensure clean state
- No isolation from other services
- More complex rollback process

### 2. Vercel Deployment
**Why Not Chosen**:
- Higher cost for production workloads
- Less control over infrastructure
- Vendor lock-in
- Not aligned with self-hosting goals
- Requires trusting third-party with data

### 3. Kubernetes
**Why Not Chosen**:
- Overkill for single-instance deployment
- Complex orchestration not needed initially
- Steep learning curve
- Resource overhead for small deployments
- Can migrate to K8s later if needed

### 4. Virtual Machines
**Why Not Chosen**:
- Higher resource overhead than containers
- Slower startup times
- More complex to version and distribute
- Less efficient resource utilization

### 5. PM2 Process Manager
**Why Not Chosen**:
- Less isolation than containers
- Still requires consistent Node.js environment
- More manual configuration management
- Difficult to guarantee reproducibility

## References
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Next.js Standalone Output](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)

## Implementation Notes

### Dockerfile Architecture

```dockerfile
# Stage 1: Base image with Node.js
FROM node:20-alpine AS base

# Stage 2: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build

# Stage 4: Production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

### Build Optimization Techniques

#### 1. Layer Caching Strategy
- Install dependencies before copying source code
- Dependencies change less frequently than code
- Docker caches each layer independently
- Subsequent builds skip unchanged layers

#### 2. .dockerignore
```
node_modules
.git
.next
.env*
npm-debug.log
README.md
.dockerignore
Dockerfile
.gitignore
```

#### 3. Standalone Output Mode
```typescript
// next.config.ts
const nextConfig = {
  output: 'standalone',  // Minimal production build
};
```

### Build and Deployment Commands

```bash
# Build image for ARM64 (Apple Silicon)
docker build --platform linux/arm64 -t myro-productions-website:latest .

# Build with build arguments
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://myroproductions.com \
  --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_... \
  -t myro-productions-website:latest .

# Run container
docker run -d \
  --name myro-website \
  -p 3000:3000 \
  --env-file .env.production \
  myro-productions-website:latest

# View logs
docker logs -f myro-website

# Stop and remove
docker stop myro-website
docker rm myro-website
```

### Environment Variable Management

#### Build-time Variables (baked into client bundle)
```dockerfile
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

#### Runtime Variables (server-side only)
```bash
# Passed at runtime via --env-file or -e flags
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
JWT_SECRET=...
```

### Docker Compose Configuration

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
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - app-network

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres-data:

networks:
  app-network:
    driver: bridge
```

### Security Considerations

1. **Non-root User**: Container runs as `nextjs` user (UID 1001)
2. **Minimal Base Image**: Alpine Linux reduces attack surface
3. **No Secrets in Image**: Environment variables passed at runtime
4. **Image Scanning**: Run `docker scan` to detect vulnerabilities
5. **Regular Updates**: Update base images regularly for security patches

### Monitoring and Health Checks

```yaml
# docker-compose.yml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

```typescript
// app/api/health/route.ts
export async function GET() {
  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: 'healthy' }, { status: 200 });
  } catch (error) {
    return Response.json({ status: 'unhealthy' }, { status: 503 });
  }
}
```

### Image Size Comparison

- **Without optimization**: 1.2GB
- **With multi-stage build**: 180MB
- **With standalone output**: 150MB
- **With Alpine Linux**: 140MB

### Deployment Workflow

1. **Build**: `docker build -t myro-productions-website:v1.0.0 .`
2. **Tag**: `docker tag myro-productions-website:v1.0.0 myro-productions-website:latest`
3. **Stop Old**: `docker stop myro-website`
4. **Remove Old**: `docker rm myro-website`
5. **Run New**: `docker run -d --name myro-website -p 3000:3000 --env-file .env.production myro-productions-website:latest`
6. **Verify**: `docker logs myro-website`
7. **Health Check**: `curl http://localhost:3000/api/health`
