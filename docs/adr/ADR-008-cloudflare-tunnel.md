# ADR-008: Cloudflare Tunnel for Self-Hosting

## Status
Accepted

## Context
The application is deployed on self-hosted infrastructure (homelab at 10.0.0.223) and requires secure public internet access without exposing the home network to security risks. Key requirements included:

- Secure public access without opening router firewall ports
- DDoS protection and traffic filtering
- SSL/TLS certificate management
- CDN and performance optimization
- Zero-trust network architecture
- Ability to run multiple services behind single tunnel
- No additional hardware or VPS costs

Challenges with traditional approaches:
- Port forwarding exposes home IP and creates security risks
- Dynamic DNS requires managing changing IP addresses
- VPN solutions add complexity and latency
- VPS hosting adds monthly costs

## Decision
Implement Cloudflare Tunnel (formerly Argo Tunnel) to provide secure, encrypted access to the self-hosted application without exposing ports or home IP address.

Implementation includes:
- Cloudflare Tunnel daemon (cloudflared) running on Docker host
- Cloudflare DNS management for domain routing
- Tunnel configuration for multiple services
- Zero Trust policies for admin routes
- SSL/TLS termination at Cloudflare edge
- Automatic certificate management

## Consequences

### Positive
- **Security**: No exposed ports, home IP remains hidden, DDoS protection included
- **Zero Trust**: Built-in access policies for sensitive routes (/admin)
- **SSL/TLS**: Automatic certificate management, no Let's Encrypt setup required
- **CDN**: Global edge network provides caching and performance benefits
- **Multiple Services**: Single tunnel can serve multiple applications
- **Reliability**: Cloudflare's 100% uptime SLA and global infrastructure
- **Cost**: Free tier available, no VPS or additional infrastructure costs
- **Easy Setup**: Simple configuration via Cloudflare dashboard or CLI
- **IPv6 Support**: Native IPv6 connectivity through Cloudflare network
- **Traffic Analytics**: Built-in analytics and logging in Cloudflare dashboard

### Negative
- **Cloudflare Dependency**: Critical dependency on Cloudflare infrastructure
- **Traffic Routing**: All traffic routes through Cloudflare (privacy consideration)
- **Latency**: Small additional latency from tunnel overhead (~5-10ms)
- **WebSocket Limitations**: Some WebSocket configurations require additional setup
- **Bandwidth Limits**: Free tier has soft limits (though generous for portfolio site)
- **Control**: Less control compared to owning full network stack

### Neutral
- **Cloudflare Account**: Requires Cloudflare account and domain DNS managed by Cloudflare
- **Daemon Management**: Requires running cloudflared daemon (but containerized)
- **Regional Performance**: Performance depends on proximity to Cloudflare edge locations

## Alternatives Considered

### 1. Port Forwarding + Dynamic DNS
**Why Not Chosen**:
- Exposes home IP address publicly
- Security risk from exposed ports
- Requires manual SSL certificate management
- No DDoS protection
- Dynamic IP changes require DNS updates
- Firewall configuration complexity

### 2. VPN (WireGuard/OpenVPN)
**Why Not Chosen**:
- Adds latency and complexity
- Requires client-side VPN setup for users
- Not suitable for public-facing website
- Manual certificate management
- Split-tunnel configuration complexity

### 3. Reverse Proxy VPS (nginx on DigitalOcean/Linode)
**Why Not Chosen**:
- Monthly VPS hosting costs ($5-20/month)
- Additional server to maintain and secure
- Two points of failure (VPS + homelab)
- More complex networking setup
- Still requires VPN or tunnel from VPS to homelab

### 4. ngrok
**Why Not Chosen**:
- Higher cost for custom domains and features
- Less integrated with CDN and DNS
- Smaller edge network than Cloudflare
- More focused on development than production
- Less robust DDoS protection

### 5. Tailscale Funnel
**Why Not Chosen**:
- Newer feature with less proven track record
- Smaller edge network
- Less integrated CDN and caching
- Fewer security features compared to Cloudflare

### 6. Traditional Hosting (Vercel/Netlify)
**Why Not Chosen**:
- Higher costs for production workloads
- Cannot leverage existing homelab infrastructure
- Less control over environment
- Vendor lock-in
- Database hosting requires additional service

## References
- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflare Zero Trust](https://developers.cloudflare.com/cloudflare-one/)
- [Cloudflare Tunnel GitHub](https://github.com/cloudflare/cloudflared)
- [Self-Hosting with Cloudflare Tunnel](https://blog.cloudflare.com/highly-available-and-highly-scalable-cloudflare-tunnels/)

## Implementation Notes

### Architecture Overview

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Internet   │────────▶│  Cloudflare  │────────▶│   Homelab    │
│    Users     │         │     Edge     │         │  Docker Host │
└──────────────┘         └──────────────┘         └──────────────┘
                                │                         │
                                │  Encrypted Tunnel       │
                                │  (WireGuard/QUIC)       │
                                │                         │
                                │                  ┌──────▼─────┐
                                │                  │ cloudflared│
                                │                  │  (Docker)  │
                                │                  └──────┬─────┘
                                │                         │
                                │                  ┌──────▼─────┐
                                │                  │  Next.js   │
                                │                  │ App :3000  │
                                │                  └────────────┘
```

### Installation and Setup

#### 1. Install cloudflared (via Docker)
```yaml
# docker-compose.yml
version: '3.8'

services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflare-tunnel
    command: tunnel --no-autoupdate run --token ${CLOUDFLARE_TUNNEL_TOKEN}
    restart: unless-stopped
    networks:
      - app-network

  web:
    image: myro-productions-website:latest
    container_name: myro-website
    ports:
      - "3000:3000"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

#### 2. Create Tunnel via Cloudflare Dashboard
1. Navigate to Cloudflare Zero Trust dashboard
2. Go to Access > Tunnels
3. Click "Create a tunnel"
4. Name: `myro-homelab-tunnel`
5. Copy the tunnel token
6. Configure public hostname routing

#### 3. Configure Tunnel Routes
```yaml
# config.yml (alternative to dashboard configuration)
tunnel: myro-homelab-tunnel
credentials-file: /etc/cloudflared/credentials.json

ingress:
  # Main website
  - hostname: myroproductions.com
    service: http://myro-website:3000

  # WWW redirect
  - hostname: www.myroproductions.com
    service: http://myro-website:3000

  # Catch-all rule (required)
  - service: http_status:404
```

#### 4. DNS Configuration
Cloudflare automatically creates CNAME records:
```
myroproductions.com CNAME myro-homelab-tunnel.cfargotunnel.com
www.myroproductions.com CNAME myro-homelab-tunnel.cfargotunnel.com
```

### Zero Trust Access Policies

Protect admin routes with Cloudflare Access:

```yaml
# Access Policy for /admin routes
name: "Admin Dashboard Access"
decision: allow
include:
  - emails:
      - admin@myroproductions.com
path:
  - /admin/*
```

Users must authenticate via email OTP, Google, or other identity provider before accessing admin routes.

### Security Configuration

#### 1. SSL/TLS Settings
- **SSL Mode**: Full (strict) - Cloudflare validates origin certificate
- **Always Use HTTPS**: Enabled
- **Minimum TLS Version**: TLS 1.2
- **TLS 1.3**: Enabled
- **Automatic HTTPS Rewrites**: Enabled

#### 2. WAF Rules
```
# Block common attack patterns
- SQL injection attempts
- XSS attempts
- Path traversal
- Rate limiting (100 requests per minute per IP)
```

#### 3. Bot Protection
- **Bot Fight Mode**: Enabled (free tier)
- **Challenge Passage**: 30 minutes
- **Security Level**: Medium

### Performance Optimization

#### 1. Caching Rules
```
# Cache static assets aggressively
Cache-Control: public, max-age=31536000, immutable
Assets: /_next/static/*

# Cache images with revalidation
Cache-Control: public, max-age=86400, must-revalidate
Assets: /images/*

# Don't cache API routes or admin
Cache-Control: no-store
Routes: /api/*, /admin/*
```

#### 2. CDN Configuration
- **Auto Minify**: HTML, CSS, JavaScript enabled
- **Brotli Compression**: Enabled
- **Early Hints**: Enabled for faster page loads
- **HTTP/2**: Enabled
- **HTTP/3 (QUIC)**: Enabled

### Monitoring and Observability

#### 1. Analytics
- Traffic analytics in Cloudflare dashboard
- Bandwidth usage tracking
- Cache hit ratios
- Security events and threats blocked

#### 2. Logs
```bash
# View cloudflared logs
docker logs -f cloudflare-tunnel

# Look for connection status
# "Registered tunnel connection"
# "Serving tunnel"
```

#### 3. Health Checks
Cloudflare automatically health checks the tunnel:
- Interval: 30 seconds
- Timeout: 5 seconds
- Automatic failover if unhealthy

### Disaster Recovery

#### 1. Tunnel Redundancy
Run multiple cloudflared instances for high availability:
```yaml
services:
  cloudflared-1:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run --token ${TUNNEL_TOKEN}
    restart: unless-stopped

  cloudflared-2:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run --token ${TUNNEL_TOKEN}
    restart: unless-stopped
```

Cloudflare automatically load balances between tunnel replicas.

#### 2. Backup Configuration
- Export tunnel configuration regularly
- Store credentials file securely (1Password/Vaultwarden)
- Document DNS configuration
- Keep tunnel token in secure backup

### Troubleshooting

#### Connection Issues
```bash
# Test tunnel connectivity
docker exec cloudflare-tunnel cloudflared tunnel info

# Check DNS resolution
dig myroproductions.com

# Test from outside network
curl -I https://myroproductions.com
```

#### Performance Issues
- Check Cloudflare analytics for cache hit ratio
- Verify compression is enabled
- Review caching rules for static assets
- Monitor tunnel latency in logs

### Cost Analysis

**Cloudflare Free Tier Includes:**
- Unlimited tunnels
- Unlimited bandwidth (with fair use policy)
- DDoS protection
- SSL certificates
- CDN caching
- Basic analytics
- DNS management

**No additional costs for this deployment scenario.**

Compare to alternatives:
- VPS hosting: $5-20/month
- ngrok Pro: $8/month
- Traditional hosting: $10-50/month

### Migration Path

If Cloudflare becomes unsuitable:
1. Set up alternative tunnel (WireGuard) or VPS proxy
2. Update DNS records to point to new infrastructure
3. Migrate SSL certificates (or use Let's Encrypt)
4. Update firewall rules if needed
5. Test thoroughly before switching DNS

DNS TTL kept at 5 minutes for quick failover if needed.
