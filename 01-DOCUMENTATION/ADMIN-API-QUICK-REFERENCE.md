# Admin API Quick Reference

Quick reference for all admin API endpoints.

## Base URL
All endpoints are prefixed with `/api/admin`

---

## Clients API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/clients` | List clients (pagination, search, filter by status) |
| `POST` | `/clients` | Create new client |
| `GET` | `/clients/[id]` | Get client details with all relations |
| `PUT` | `/clients/[id]` | Update client |
| `DELETE` | `/clients/[id]` | Deactivate client (soft delete) |

**List Query Params:**
- `page`, `limit`, `search`, `status`

**Create/Update Fields:**
- `email`, `name`, `company`, `phone`, `notes`, `status`

---

## Subscriptions API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/subscriptions` | List subscriptions (pagination, filters) |
| `GET` | `/subscriptions/[id]` | Get subscription details |
| `POST` | `/subscriptions/create` | Create subscription via Stripe |
| `POST` | `/subscriptions/[id]/cancel` | Cancel subscription via Stripe |

**List Query Params:**
- `page`, `limit`, `client_id`, `status`, `product_type`

**Create Fields:**
- `client_id`, `price_id`, `product_type`, `trial_days`

**Cancel Fields:**
- `cancel_at_period_end`, `reason`

---

## Projects API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects` | List projects (pagination, filters) |
| `POST` | `/projects` | Create new project |
| `GET` | `/projects/[id]` | Get project details |
| `PUT` | `/projects/[id]` | Update project |
| `DELETE` | `/projects/[id]` | Delete project (if no payments) |

**List Query Params:**
- `page`, `limit`, `client_id`, `status`, `search`

**Create/Update Fields:**
- `client_id`, `name`, `description`, `status`, `start_date`, `end_date`, `budget_cents`, `notes`

---

## Payments API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/payments` | List payments (pagination, extensive filters) |
| `GET` | `/payments/[id]` | Get payment details |
| `POST` | `/payments/[id]/refund` | Refund payment via Stripe |

**List Query Params:**
- `page`, `limit`, `client_id`, `project_id`, `subscription_id`, `payment_type`, `status`, `start_date`, `end_date`

**Refund Fields:**
- `amount_cents`, `reason`, `notes`

---

## Dashboard API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard/stats` | Get comprehensive dashboard statistics |

**Statistics Included:**
- Clients (total, active, new, recent)
- Subscriptions (total, active, MRR)
- Projects (total, by status, recent)
- Payments (revenue, growth, pending, failed)
- Top clients by revenue

---

## Enums Reference

### Client Status
- `ACTIVE`
- `INACTIVE`
- `ARCHIVED`

### Subscription Status
- `ACTIVE`
- `PAST_DUE`
- `CANCELED`
- `UNPAID`
- `INCOMPLETE`
- `TRIALING`

### Product Type
- `MAINTENANCE_BASIC`
- `MAINTENANCE_PRO`
- `SUPPORT_STANDARD`
- `SUPPORT_PREMIUM`
- `CUSTOM`

### Project Status
- `PLANNING`
- `IN_PROGRESS`
- `ON_HOLD`
- `COMPLETED`
- `CANCELED`

### Payment Type
- `ONE_TIME`
- `SUBSCRIPTION`
- `DEPOSIT`
- `FINAL_PAYMENT`
- `REFUND`

### Payment Status
- `PENDING`
- `PROCESSING`
- `SUCCEEDED`
- `FAILED`
- `CANCELED`
- `REFUNDED`

### Refund Reasons
- `duplicate`
- `fraudulent`
- `requested_by_customer`

---

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

All endpoints require admin authentication via session cookies.

**Headers Required:**
- Session cookie (automatically sent by browser)

**Unauthorized Response (401):**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

## Activity Logging

All mutations are automatically logged:
- `create_client`, `update_client`, `deactivate_client`
- `create_subscription`, `cancel_subscription`
- `create_project`, `update_project`, `delete_project`
- `refund_payment`

**Logged Information:**
- Admin ID
- Action type
- Entity type and ID
- Client ID (if applicable)
- Details (changes, amounts, etc.)
- IP address
- Timestamp

---

## Common Use Cases

### Create Client with Subscription
```typescript
// 1. Create client
POST /api/admin/clients
{ email, name, company }

// 2. Create subscription
POST /api/admin/subscriptions/create
{ client_id, price_id, product_type }
```

### Refund Payment
```typescript
POST /api/admin/payments/[id]/refund
{ amount_cents, reason: "requested_by_customer" }
```

### Get Dashboard Overview
```typescript
GET /api/admin/dashboard/stats
// Returns: clients, subscriptions, projects, payments, top_clients
```

### Search Clients
```typescript
GET /api/admin/clients?search=john&status=ACTIVE&page=1&limit=20
```

### Filter Payments by Date
```typescript
GET /api/admin/payments?start_date=2024-01-01T00:00:00.000Z&end_date=2024-01-31T23:59:59.999Z
```

---

**See:** [Full API Reference](./ADMIN-API-REFERENCE.md) for detailed documentation
