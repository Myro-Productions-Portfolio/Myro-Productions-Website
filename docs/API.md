# API Documentation

REST API documentation for the Myro Productions website.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Admin API](#admin-api)
- [Public API](#public-api)
- [Webhooks](#webhooks)
- [Error Handling](#error-handling)

## Overview

Base URL: `https://myroproductions.com/api` (production)
Base URL: `http://localhost:3000/api` (development)

### Response Format

All API responses follow this format:

```json
{
  "data": {},           // Response data (on success)
  "error": "message",   // Error message (on failure)
  "status": 200         // HTTP status code
}
```

### HTTP Status Codes

- `200 OK` - Successful GET/PUT/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Authentication

Admin API routes require JWT authentication via httpOnly cookie.

### Login

```http
POST /api/admin/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "admin": {
    "id": "user_123",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

Sets `auth_token` httpOnly cookie for subsequent requests.

### Logout

```http
POST /api/admin/auth/logout
```

Response:
```json
{
  "success": true
}
```

Clears `auth_token` cookie.

### Verify Session

```http
GET /api/admin/auth/verify
```

Response:
```json
{
  "valid": true,
  "user": {
    "id": "user_123",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

## Admin API

All admin routes require authentication (`/api/admin/*`).

### Clients

#### List Clients

```http
GET /api/admin/clients?status=ACTIVE&limit=50&offset=0
```

Query Parameters:
- `status` (optional): Filter by status (`ACTIVE`, `INACTIVE`, `ARCHIVED`)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

Response:
```json
{
  "clients": [
    {
      "id": "client_123",
      "email": "client@example.com",
      "name": "John Doe",
      "company": "Acme Corp",
      "status": "ACTIVE",
      "stripe_customer_id": "cus_123",
      "created_at": "2026-01-15T10:00:00Z",
      "subscriptions": [],
      "projects": []
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

#### Get Client

```http
GET /api/admin/clients/[id]
```

Response:
```json
{
  "client": {
    "id": "client_123",
    "email": "client@example.com",
    "name": "John Doe",
    "company": "Acme Corp",
    "phone": "+1234567890",
    "stripe_customer_id": "cus_123",
    "status": "ACTIVE",
    "notes": "VIP client",
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-02-16T12:00:00Z",
    "subscriptions": [...],
    "projects": [...],
    "payments": [...]
  }
}
```

#### Create Client

```http
POST /api/admin/clients
Content-Type: application/json

{
  "email": "newclient@example.com",
  "name": "Jane Smith",
  "company": "Tech Startup",
  "phone": "+1234567890",
  "notes": "Referred by John"
}
```

Response: `201 Created`
```json
{
  "client": {
    "id": "client_456",
    "email": "newclient@example.com",
    "name": "Jane Smith",
    ...
  }
}
```

#### Update Client

```http
PATCH /api/admin/clients/[id]
Content-Type: application/json

{
  "name": "Jane Smith-Jones",
  "status": "INACTIVE"
}
```

Response:
```json
{
  "client": {
    "id": "client_456",
    "name": "Jane Smith-Jones",
    "status": "INACTIVE",
    ...
  }
}
```

#### Delete Client

```http
DELETE /api/admin/clients/[id]
```

Response: `204 No Content`

### Projects

#### List Projects

```http
GET /api/admin/projects?client_id=client_123&status=IN_PROGRESS
```

Query Parameters:
- `client_id` (optional): Filter by client
- `status` (optional): Filter by status

Response:
```json
{
  "projects": [
    {
      "id": "project_123",
      "client_id": "client_123",
      "name": "Website Redesign",
      "description": "Complete website overhaul",
      "status": "IN_PROGRESS",
      "start_date": "2026-02-01T00:00:00Z",
      "end_date": "2026-04-30T00:00:00Z",
      "budget_cents": 500000,
      "client": {
        "name": "Acme Corp",
        "email": "client@example.com"
      }
    }
  ]
}
```

#### Create Project

```http
POST /api/admin/projects
Content-Type: application/json

{
  "client_id": "client_123",
  "name": "Mobile App Development",
  "description": "iOS and Android apps",
  "start_date": "2026-03-01",
  "budget_cents": 1000000
}
```

Response: `201 Created`

### Payments

#### List Payments

```http
GET /api/admin/payments?client_id=client_123&status=SUCCEEDED
```

Response:
```json
{
  "payments": [
    {
      "id": "payment_123",
      "client_id": "client_123",
      "amount_cents": 50000,
      "currency": "usd",
      "status": "SUCCEEDED",
      "payment_type": "ONE_TIME",
      "stripe_payment_intent_id": "pi_123",
      "paid_at": "2026-02-15T14:30:00Z",
      "client": {
        "name": "Acme Corp"
      }
    }
  ]
}
```

#### Refund Payment

```http
POST /api/admin/payments/[id]/refund
Content-Type: application/json

{
  "amount_cents": 50000,  // Optional, full refund if omitted
  "reason": "requested_by_customer"
}
```

Response:
```json
{
  "refund": {
    "id": "refund_123",
    "amount": 50000,
    "status": "succeeded"
  }
}
```

### Subscriptions

#### List Subscriptions

```http
GET /api/admin/subscriptions?status=ACTIVE
```

Response:
```json
{
  "subscriptions": [
    {
      "id": "sub_123",
      "client_id": "client_123",
      "stripe_subscription_id": "sub_stripe_123",
      "product_type": "MAINTENANCE_PRO",
      "status": "ACTIVE",
      "amount_cents": 29900,
      "current_period_start": "2026-02-01T00:00:00Z",
      "current_period_end": "2026-03-01T00:00:00Z",
      "client": {
        "name": "Acme Corp"
      }
    }
  ]
}
```

#### Cancel Subscription

```http
POST /api/admin/subscriptions/[id]/cancel
Content-Type: application/json

{
  "cancel_at_period_end": true  // or false for immediate cancellation
}
```

## Public API

Public routes accessible without authentication.

### Contact Form

```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I would like to discuss a project..."
}
```

Response:
```json
{
  "success": true,
  "message": "Thank you for contacting us. We'll get back to you soon."
}
```

### Health Check

```http
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-16T15:30:00Z",
  "uptime": 3600
}
```

## Webhooks

### Stripe Webhook

Endpoint: `/api/webhooks/stripe`

Stripe sends webhook events to this endpoint.

Supported events:
- `payment_intent.succeeded`
- `payment_intent.failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Webhook signature verification required (configured via `STRIPE_WEBHOOK_SECRET`).

Example payload:
```json
{
  "id": "evt_123",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_123",
      "amount": 50000,
      "currency": "usd",
      "status": "succeeded"
    }
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}  // Optional additional details
}
```

### Common Errors

#### Validation Error (400)

```json
{
  "error": "Invalid input",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": ["Invalid email format"],
    "amount": ["Amount must be positive"]
  }
}
```

#### Unauthorized (401)

```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

#### Forbidden (403)

```json
{
  "error": "Insufficient permissions",
  "code": "FORBIDDEN"
}
```

#### Not Found (404)

```json
{
  "error": "Resource not found",
  "code": "NOT_FOUND"
}
```

#### Rate Limit (429)

```json
{
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 60
}
```

#### Server Error (500)

```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## Rate Limiting

- **Public routes**: 100 requests per minute per IP
- **Admin routes**: 1000 requests per minute per user
- **Login endpoint**: 5 requests per minute per IP

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1645023600
```

## Testing API

### Using curl

```bash
# Login
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}' \
  -c cookies.txt

# List clients (using saved cookies)
curl -X GET http://localhost:3000/api/admin/clients \
  -b cookies.txt

# Create client
curl -X POST http://localhost:3000/api/admin/clients \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"email":"new@example.com","name":"New Client"}'
```

### Using Postman

1. Import API collection (if available)
2. Set environment variables
3. Authenticate via login endpoint
4. Cookie automatically saved for subsequent requests

### Using Stripe CLI

Test webhooks locally:

```bash
# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

---

For implementation details, see [Architecture Documentation](./ARCHITECTURE.md).
