# Admin API Reference

Comprehensive API documentation for the admin dashboard backend.

## Table of Contents

- [Authentication](#authentication)
- [Clients API](#clients-api)
- [Subscriptions API](#subscriptions-api)
- [Projects API](#projects-api)
- [Payments API](#payments-api)
- [Dashboard API](#dashboard-api)
- [Activity Logging](#activity-logging)
- [Error Handling](#error-handling)

---

## Authentication

All admin API routes require authentication via session cookies. The authentication is handled by `requireAuthFromCookies()` middleware.

**Authentication Flow:**
1. User logs in via `/api/admin/auth/login`
2. Session cookie is set
3. All subsequent requests include the session cookie
4. API routes verify the session using `requireAuthFromCookies()`

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

## Clients API

### List Clients
`GET /api/admin/clients`

List all clients with pagination and search capabilities.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page
- `search` (string, optional) - Search by name, email, or company
- `status` (enum, optional) - Filter by status: `ACTIVE`, `INACTIVE`, `ARCHIVED`

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "client_id",
        "email": "client@example.com",
        "name": "John Doe",
        "company": "Acme Corp",
        "phone": "+1234567890",
        "stripe_customer_id": "cus_xxx",
        "status": "ACTIVE",
        "notes": "VIP client",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "subscriptions": [...],
        "projects": [...],
        "_count": {
          "payments": 5
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

### Create Client
`POST /api/admin/clients`

Create a new client.

**Request Body:**
```json
{
  "email": "client@example.com",
  "name": "John Doe",
  "company": "Acme Corp",
  "phone": "+1234567890",
  "notes": "VIP client",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "client": {
      "id": "client_id",
      "email": "client@example.com",
      "name": "John Doe",
      ...
    }
  }
}
```

### Get Client
`GET /api/admin/clients/[id]`

Get single client with all related data (subscriptions, projects, payments, activity logs).

**Response:**
```json
{
  "success": true,
  "data": {
    "client": {
      "id": "client_id",
      "email": "client@example.com",
      "name": "John Doe",
      "subscriptions": [...],
      "projects": [...],
      "payments": [...],
      "activity_logs": [...]
    }
  }
}
```

### Update Client
`PUT /api/admin/clients/[id]`

Update client information.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "company": "New Company",
  "status": "INACTIVE"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "client": { ... }
  }
}
```

### Deactivate Client
`DELETE /api/admin/clients/[id]`

Soft delete by setting status to `ARCHIVED`.

**Response:**
```json
{
  "success": true,
  "data": {
    "client": { ... }
  }
}
```

---

## Subscriptions API

### List Subscriptions
`GET /api/admin/subscriptions`

List all subscriptions with filtering.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `client_id` (string, optional) - Filter by client
- `status` (enum, optional) - `ACTIVE`, `PAST_DUE`, `CANCELED`, `UNPAID`, `INCOMPLETE`, `TRIALING`
- `product_type` (enum, optional) - `MAINTENANCE_BASIC`, `MAINTENANCE_PRO`, `SUPPORT_STANDARD`, `SUPPORT_PREMIUM`, `CUSTOM`

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "id": "sub_id",
        "client_id": "client_id",
        "stripe_subscription_id": "sub_xxx",
        "product_type": "MAINTENANCE_PRO",
        "status": "ACTIVE",
        "amount_cents": 9900,
        "currency": "usd",
        "current_period_start": "2024-01-01T00:00:00.000Z",
        "current_period_end": "2024-02-01T00:00:00.000Z",
        "cancel_at_period_end": false,
        "canceled_at": null,
        "client": { ... },
        "_count": {
          "payments": 3
        }
      }
    ],
    "pagination": { ... }
  }
}
```

### Get Subscription
`GET /api/admin/subscriptions/[id]`

Get subscription details with client and payment history.

### Create Subscription
`POST /api/admin/subscriptions/create`

Manually create subscription via Stripe.

**Request Body:**
```json
{
  "client_id": "client_id",
  "price_id": "price_xxx",
  "product_type": "MAINTENANCE_PRO",
  "trial_days": 14
}
```

**Process:**
1. Verifies client exists
2. Creates Stripe customer if needed
3. Creates Stripe subscription
4. Stores subscription in database
5. Logs activity

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "subscription": { ... }
  }
}
```

### Cancel Subscription
`POST /api/admin/subscriptions/[id]/cancel`

Cancel subscription via Stripe.

**Request Body:**
```json
{
  "cancel_at_period_end": true,
  "reason": "Customer request"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": { ... }
  }
}
```

---

## Projects API

### List Projects
`GET /api/admin/projects`

List all projects with filtering.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `client_id` (string, optional) - Filter by client
- `status` (enum, optional) - `PLANNING`, `IN_PROGRESS`, `ON_HOLD`, `COMPLETED`, `CANCELED`
- `search` (string, optional) - Search by name or description

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project_id",
        "client_id": "client_id",
        "name": "Website Redesign",
        "description": "Complete website overhaul",
        "status": "IN_PROGRESS",
        "start_date": "2024-01-01T00:00:00.000Z",
        "end_date": "2024-03-01T00:00:00.000Z",
        "budget_cents": 500000,
        "notes": "High priority",
        "client": { ... },
        "_count": {
          "payments": 2
        }
      }
    ],
    "pagination": { ... }
  }
}
```

### Create Project
`POST /api/admin/projects`

Create a new project.

**Request Body:**
```json
{
  "client_id": "client_id",
  "name": "Website Redesign",
  "description": "Complete website overhaul",
  "status": "PLANNING",
  "start_date": "2024-01-01T00:00:00.000Z",
  "end_date": "2024-03-01T00:00:00.000Z",
  "budget_cents": 500000,
  "notes": "High priority"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "project": { ... }
  }
}
```

### Get Project
`GET /api/admin/projects/[id]`

Get project details with client and payments.

### Update Project
`PUT /api/admin/projects/[id]`

Update project information.

**Request Body:**
```json
{
  "status": "COMPLETED",
  "notes": "Project finished successfully"
}
```

### Delete Project
`DELETE /api/admin/projects/[id]`

Delete project (only if no associated payments).

**Note:** If project has payments, it cannot be deleted. Set status to `CANCELED` instead.

---

## Payments API

### List Payments
`GET /api/admin/payments`

List all payments with extensive filtering.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `client_id` (string, optional)
- `project_id` (string, optional)
- `subscription_id` (string, optional)
- `payment_type` (enum, optional) - `ONE_TIME`, `SUBSCRIPTION`, `DEPOSIT`, `FINAL_PAYMENT`, `REFUND`
- `status` (enum, optional) - `PENDING`, `PROCESSING`, `SUCCEEDED`, `FAILED`, `CANCELED`, `REFUNDED`
- `start_date` (datetime, optional) - Filter by date range
- `end_date` (datetime, optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "payment_id",
        "client_id": "client_id",
        "project_id": "project_id",
        "subscription_id": null,
        "stripe_payment_intent_id": "pi_xxx",
        "stripe_charge_id": "ch_xxx",
        "amount_cents": 10000,
        "currency": "usd",
        "payment_type": "DEPOSIT",
        "status": "SUCCEEDED",
        "payment_method": "card",
        "metadata": { ... },
        "paid_at": "2024-01-01T00:00:00.000Z",
        "client": { ... },
        "project": { ... },
        "subscription": null
      }
    ],
    "pagination": { ... },
    "totals": {
      "total_amount_cents": 100000
    }
  }
}
```

### Get Payment
`GET /api/admin/payments/[id]`

Get payment details with client, project, and subscription info.

### Refund Payment
`POST /api/admin/payments/[id]/refund`

Refund payment via Stripe (full or partial).

**Request Body:**
```json
{
  "amount_cents": 5000,
  "reason": "requested_by_customer",
  "notes": "Customer changed their mind"
}
```

**Refund Reasons:**
- `duplicate`
- `fraudulent`
- `requested_by_customer`

**Process:**
1. Validates payment can be refunded (status = SUCCEEDED)
2. Creates refund in Stripe
3. Updates payment status (REFUNDED if full refund)
4. Creates refund payment record if partial refund
5. Logs activity

**Response:**
```json
{
  "success": true,
  "data": {
    "payment": { ... },
    "refund": {
      "id": "re_xxx",
      "amount_cents": 5000,
      "is_full_refund": false,
      "status": "succeeded"
    }
  }
}
```

---

## Dashboard API

### Get Dashboard Statistics
`GET /api/admin/dashboard/stats`

Get comprehensive dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": {
      "total": 150,
      "active": 120,
      "new_this_month": 5,
      "recent": [...]
    },
    "subscriptions": {
      "total": 80,
      "active": 70,
      "trialing": 5,
      "past_due": 3,
      "monthly_recurring_revenue_cents": 700000
    },
    "projects": {
      "total": 200,
      "active": 15,
      "completed": 150,
      "planning": 20,
      "recent": [...]
    },
    "payments": {
      "total_revenue_cents": 5000000,
      "total_payments": 500,
      "this_month": {
        "revenue_cents": 150000,
        "count": 25
      },
      "last_month": {
        "revenue_cents": 140000,
        "count": 22
      },
      "revenue_growth_percentage": 7.14,
      "pending": {
        "amount_cents": 5000,
        "count": 2
      },
      "failed_this_month": 3,
      "recent": [...]
    },
    "top_clients": [
      {
        "client": { ... },
        "total_revenue_cents": 100000,
        "payment_count": 10
      }
    ]
  }
}
```

**Statistics Included:**
- Client metrics (total, active, new this month, recent)
- Subscription metrics (total, active, MRR)
- Project metrics (total, by status, recent)
- Payment metrics (total revenue, monthly revenue, growth %, pending, failed)
- Top 5 clients by revenue

---

## Activity Logging

All mutation operations (create, update, delete, refund, cancel) are automatically logged to the `activity_log` table.

**Activity Log Entry:**
```typescript
{
  admin_id: string;       // Who performed the action
  client_id?: string;     // Related client (if applicable)
  action: string;         // Action type (e.g., "create_client", "refund_payment")
  entity_type: string;    // Entity type (e.g., "client", "payment")
  entity_id?: string;     // Entity ID
  details: object;        // Additional context (changes, amounts, etc.)
  ip_address?: string;    // Admin's IP address
  created_at: Date;       // When action occurred
}
```

**Logged Actions:**
- `create_client`, `update_client`, `deactivate_client`
- `create_subscription`, `cancel_subscription`
- `create_project`, `update_project`, `delete_project`
- `refund_payment`

**Example Activity Details:**
```json
{
  "action": "refund_payment",
  "details": {
    "amount_cents": 5000,
    "original_amount_cents": 10000,
    "is_full_refund": false,
    "reason": "requested_by_customer",
    "stripe_refund_id": "re_xxx"
  }
}
```

---

## Error Handling

All API routes follow consistent error handling patterns.

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors, business logic errors)
- `401` - Unauthorized (not authenticated)
- `404` - Not Found
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "success": false,
  "error": "Error message"
}
```

**Validation Errors (Zod):**
```json
{
  "success": false,
  "error": "Valid email is required"
}
```

**Stripe Errors:**
```json
{
  "success": false,
  "error": "Stripe error message"
}
```

**Common Error Scenarios:**

1. **Unauthorized Access:**
   - Status: 401
   - Response: `{ "success": false, "error": "Unauthorized" }`

2. **Resource Not Found:**
   - Status: 404
   - Response: `{ "success": false, "error": "Client not found" }`

3. **Validation Error:**
   - Status: 400
   - Response: `{ "success": false, "error": "Valid email is required" }`

4. **Business Logic Error:**
   - Status: 400
   - Response: `{ "success": false, "error": "Cannot delete project with associated payments" }`

5. **Stripe API Error:**
   - Status: 400
   - Response: `{ "success": false, "error": "Stripe error message" }`

---

## Usage Examples

### Complete Client Management Flow

```typescript
// 1. Create a client
const createResponse = await fetch('/api/admin/clients', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'client@example.com',
    name: 'John Doe',
    company: 'Acme Corp',
  }),
});

const { data: { client } } = await createResponse.json();

// 2. Create a subscription for the client
const subResponse = await fetch('/api/admin/subscriptions/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: client.id,
    price_id: 'price_xxx',
    product_type: 'MAINTENANCE_PRO',
    trial_days: 14,
  }),
});

// 3. Create a project for the client
const projectResponse = await fetch('/api/admin/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: client.id,
    name: 'Website Redesign',
    status: 'PLANNING',
    budget_cents: 500000,
  }),
});

// 4. View client details with all related data
const detailResponse = await fetch(`/api/admin/clients/${client.id}`);
const { data } = await detailResponse.json();
// Returns client with subscriptions, projects, payments, activity logs
```

### Dashboard Data Fetching

```typescript
// Fetch dashboard statistics
const statsResponse = await fetch('/api/admin/dashboard/stats');
const { data: stats } = await statsResponse.json();

console.log(`MRR: $${stats.subscriptions.monthly_recurring_revenue_cents / 100}`);
console.log(`Active Clients: ${stats.clients.active}`);
console.log(`Revenue Growth: ${stats.payments.revenue_growth_percentage}%`);
```

---

## Development Notes

### Stripe Integration
- All subscription and refund operations call Stripe API
- Stripe customer IDs are automatically created if needed
- Stripe metadata includes admin ID and action context
- Webhooks handle asynchronous Stripe events (see `/api/stripe/webhooks`)

### Database Relations
- Clients have many subscriptions, projects, payments
- Subscriptions belong to client, have many payments
- Projects belong to client, have many payments
- Payments can belong to client, project, and/or subscription

### Pagination
- Default limit: 20 items
- Maximum limit: 100 items
- Page numbers start at 1
- Total pages calculated: `Math.ceil(total / limit)`

### Activity Logging
- Logging is non-blocking (errors don't break API calls)
- IP address extracted from `x-forwarded-for` or `x-real-ip` headers
- All details stored as JSONB for flexibility

---

**Last Updated:** 2024-01-24
**Version:** 1.0.0
