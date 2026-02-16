# Security Policy

Security considerations and best practices for the Myro Productions website.

## Reporting Security Vulnerabilities

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them by emailing: **security@myroproductions.com**

Include:
- Type of vulnerability
- Location (file, line, component)
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and work to address the issue promptly.

## Security Architecture

### Network Security

**Cloudflare Protection**:
- DDoS protection
- WAF (Web Application Firewall)
- Bot protection
- Rate limiting
- SSL/TLS termination (TLS 1.3)

**No Exposed Ports**:
- Cloudflare Tunnel (no port forwarding)
- Home network IP hidden
- Encrypted tunnel connection

### Authentication & Authorization

**JWT with httpOnly Cookies**:
- Stateless authentication
- httpOnly cookies (XSS protection)
- SameSite=Lax (CSRF protection)
- Secure flag in production
- 1-hour token expiration

**Password Security**:
- bcrypt hashing (10 rounds)
- Minimum 12 characters required
- Complexity requirements enforced
- No password hints or recovery questions

**Admin Access Control**:
- Role-based permissions (SUPER_ADMIN, ADMIN, VIEWER)
- Middleware route protection
- Session verification on every request
- Automatic logout on token expiration

### Data Security

**Database**:
- PostgreSQL with parameterized queries (Prisma)
- SQL injection prevention
- Encrypted connections
- Minimal user permissions
- Regular backups

**Sensitive Data**:
- Environment variables for secrets
- Never log passwords or tokens
- PCI compliance for payments (handled by Stripe)
- Personal data encryption at rest

**API Security**:
- Input validation with Zod schemas
- Rate limiting per endpoint
- Request size limits
- CORS configuration

### Application Security

**XSS Prevention**:
- React's automatic escaping
- httpOnly cookies for tokens
- Content Security Policy headers
- Sanitized user inputs

**CSRF Prevention**:
- SameSite cookies
- Token-based verification for sensitive actions
- Double-submit cookie pattern (where applicable)

**SQL Injection Prevention**:
- Prisma ORM with parameterized queries
- No raw SQL (except audited cases)
- Input validation before queries

### Infrastructure Security

**Docker Containers**:
- Non-root user (nextjs:1001)
- Minimal Alpine Linux base
- No unnecessary packages
- Regular security updates
- Image scanning

**Secrets Management**:
- Environment variables (never in code)
- .env files excluded from git
- Secure storage (Vaultwarden)
- Regular rotation

## Security Best Practices

### For Developers

1. **Never commit secrets**:
   ```bash
   # Check before committing
   git diff --cached | grep -i "secret\|password\|key"
   ```

2. **Validate all inputs**:
   ```typescript
   const schema = z.object({
     email: z.string().email(),
     amount: z.number().positive(),
   });
   const result = schema.safeParse(input);
   ```

3. **Use parameterized queries**:
   ```typescript
   // GOOD: Prisma parameterized
   await prisma.user.findUnique({ where: { email } });

   // BAD: Raw SQL with interpolation
   await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
   ```

4. **Sanitize outputs**:
   ```typescript
   // React automatically escapes
   <div>{userInput}</div>

   // Be careful with dangerouslySetInnerHTML
   // Only use with sanitized content
   ```

5. **Check authentication**:
   ```typescript
   export async function GET(request: Request) {
     const auth = await verifyAuth();
     if (!auth) {
       return Response.json({ error: 'Unauthorized' }, { status: 401 });
     }
     // ... proceed
   }
   ```

### For Deployment

1. **Environment variables**:
   - Use strong, random secrets
   - Rotate regularly (quarterly)
   - Never commit to git
   - Use secure storage

2. **HTTPS everywhere**:
   - Force HTTPS redirects
   - HSTS headers
   - Secure cookies

3. **Regular updates**:
   - Dependencies (`npm audit fix`)
   - Docker images
   - System packages

4. **Backup database**:
   - Automated daily backups
   - Encrypted storage
   - Test restore process

5. **Monitor logs**:
   - Authentication failures
   - Unusual activity
   - Error patterns

## Security Headers

Implemented security headers:

```typescript
// next.config.ts
headers: async () => [
  {
    source: '/(.*)',
    headers: [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
    ],
  },
],
```

## Incident Response

### If Breach Suspected

1. **Immediate actions**:
   - Disconnect affected systems
   - Preserve logs and evidence
   - Notify security team

2. **Investigation**:
   - Identify breach scope
   - Determine data accessed
   - Find entry point

3. **Remediation**:
   - Patch vulnerability
   - Rotate all secrets
   - Update affected users

4. **Post-mortem**:
   - Document incident
   - Update procedures
   - Implement prevention measures

### Contact Information

- **Security Email**: security@myroproductions.com
- **Response Time**: Within 48 hours
- **Emergency**: For critical issues, contact directly

## Compliance

### Data Protection

- **GDPR**: User data handling procedures
- **CCPA**: California privacy rights respected
- **PCI DSS**: Payment processing via Stripe (Level 1 certified)

### Security Audits

- Regular dependency audits (`npm audit`)
- Code reviews for security concerns
- Penetration testing (planned quarterly)
- Third-party security assessment (annual)

## Known Limitations

**Current state**:
- No WAF beyond Cloudflare
- No intrusion detection system
- Manual secret rotation
- Basic rate limiting

**Future improvements**:
- Automated secret rotation
- Advanced monitoring (SIEM)
- Intrusion detection
- Security scanning in CI/CD

## Security Checklist

### Development

- [ ] Input validation on all endpoints
- [ ] Authentication checks on protected routes
- [ ] No secrets in code
- [ ] Parameterized database queries
- [ ] Error messages don't leak sensitive info

### Deployment

- [ ] Strong JWT secret
- [ ] Secure cookie configuration
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Secrets rotated

### Monitoring

- [ ] Authentication logs reviewed
- [ ] Error rates monitored
- [ ] Dependency vulnerabilities checked
- [ ] Backup verification

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Next.js Security Best Practices](https://nextjs.org/docs/security)
- [Stripe Security](https://stripe.com/docs/security/guide)

## Updates

This security policy is reviewed and updated quarterly.

**Last Updated**: 2026-02-16

---

**Remember**: Security is everyone's responsibility. If you see something suspicious, report it immediately.
