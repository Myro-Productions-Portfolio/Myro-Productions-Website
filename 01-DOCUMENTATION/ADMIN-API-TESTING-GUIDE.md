# Admin API Testing Guide

Guide for testing the admin API endpoints using various methods.

## Prerequisites

1. Admin user must be created and seeded in database
2. Valid admin session cookie required
3. Stripe test mode keys configured
4. Database running and migrated

## Testing Methods

### 1. Using curl (Command Line)

#### Login First
```bash
# Login to get session cookie
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}' \
  -c cookies.txt

# Use cookies.txt for subsequent requests
curl -b cookies.txt http://localhost:3000/api/admin/clients
```

### 2. Using Postman

1. **Login:**
   - POST `http://localhost:3000/api/admin/auth/login`
   - Body: `{"email": "admin@example.com", "password": "password"}`
   - Save session cookie from response

2. **Subsequent Requests:**
   - Cookies are automatically included
   - Add `Content-Type: application/json` header

### 3. Using Thunder Client (VS Code Extension)

1. Create collection "Admin API"
2. Login endpoint to get session
3. Session cookie auto-included in collection

### 4. Using Browser Console

```javascript
// Login
const loginRes = await fetch('/api/admin/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password'
  })
});

// Subsequent requests automatically include cookie
const clients = await fetch('/api/admin/clients');
const data = await clients.json();
console.log(data);
```

## Test Scenarios

### Clients API

#### Create Client
```bash
curl -b cookies.txt -X POST http://localhost:3000/api/admin/clients \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test Client",
    "company": "Test Corp",
    "phone": "+1234567890"
  }'
```

#### List Clients
```bash
# Basic list
curl -b cookies.txt http://localhost:3000/api/admin/clients

# With pagination
curl -b cookies.txt "http://localhost:3000/api/admin/clients?page=1&limit=10"

# With search
curl -b cookies.txt "http://localhost:3000/api/admin/clients?search=test"

# With status filter
curl -b cookies.txt "http://localhost:3000/api/admin/clients?status=ACTIVE"
```

#### Get Client
```bash
curl -b cookies.txt http://localhost:3000/api/admin/clients/CLIENT_ID
```

#### Update Client
```bash
curl -b cookies.txt -X PUT http://localhost:3000/api/admin/clients/CLIENT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "status": "INACTIVE"
  }'
```

#### Deactivate Client
```bash
curl -b cookies.txt -X DELETE http://localhost:3000/api/admin/clients/CLIENT_ID
```

### Subscriptions API

#### List Subscriptions
```bash
# All subscriptions
curl -b cookies.txt http://localhost:3000/api/admin/subscriptions

# Filter by client
curl -b cookies.txt "http://localhost:3000/api/admin/subscriptions?client_id=CLIENT_ID"

# Filter by status
curl -b cookies.txt "http://localhost:3000/api/admin/subscriptions?status=ACTIVE"
```

#### Get Subscription
```bash
curl -b cookies.txt http://localhost:3000/api/admin/subscriptions/SUB_ID
```

#### Create Subscription
```bash
curl -b cookies.txt -X POST http://localhost:3000/api/admin/subscriptions/create \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "CLIENT_ID",
    "price_id": "price_1234567890",
    "product_type": "MAINTENANCE_PRO",
    "trial_days": 14
  }'
```

#### Cancel Subscription
```bash
# Cancel at period end
curl -b cookies.txt -X POST http://localhost:3000/api/admin/subscriptions/SUB_ID/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "cancel_at_period_end": true,
    "reason": "Customer request"
  }'

# Cancel immediately
curl -b cookies.txt -X POST http://localhost:3000/api/admin/subscriptions/SUB_ID/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "cancel_at_period_end": false,
    "reason": "Customer request"
  }'
```

### Projects API

#### Create Project
```bash
curl -b cookies.txt -X POST http://localhost:3000/api/admin/projects \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "CLIENT_ID",
    "name": "Website Redesign",
    "description": "Complete redesign of company website",
    "status": "PLANNING",
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-03-01T00:00:00.000Z",
    "budget_cents": 500000,
    "notes": "High priority project"
  }'
```

#### List Projects
```bash
# All projects
curl -b cookies.txt http://localhost:3000/api/admin/projects

# Filter by client
curl -b cookies.txt "http://localhost:3000/api/admin/projects?client_id=CLIENT_ID"

# Filter by status
curl -b cookies.txt "http://localhost:3000/api/admin/projects?status=IN_PROGRESS"

# Search
curl -b cookies.txt "http://localhost:3000/api/admin/projects?search=website"
```

#### Get Project
```bash
curl -b cookies.txt http://localhost:3000/api/admin/projects/PROJECT_ID
```

#### Update Project
```bash
curl -b cookies.txt -X PUT http://localhost:3000/api/admin/projects/PROJECT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "notes": "Project started successfully"
  }'
```

#### Delete Project
```bash
curl -b cookies.txt -X DELETE http://localhost:3000/api/admin/projects/PROJECT_ID
```

### Payments API

#### List Payments
```bash
# All payments
curl -b cookies.txt http://localhost:3000/api/admin/payments

# Filter by client
curl -b cookies.txt "http://localhost:3000/api/admin/payments?client_id=CLIENT_ID"

# Filter by project
curl -b cookies.txt "http://localhost:3000/api/admin/payments?project_id=PROJECT_ID"

# Filter by status
curl -b cookies.txt "http://localhost:3000/api/admin/payments?status=SUCCEEDED"

# Date range
curl -b cookies.txt "http://localhost:3000/api/admin/payments?start_date=2024-01-01T00:00:00.000Z&end_date=2024-01-31T23:59:59.999Z"
```

#### Get Payment
```bash
curl -b cookies.txt http://localhost:3000/api/admin/payments/PAYMENT_ID
```

#### Refund Payment
```bash
# Full refund
curl -b cookies.txt -X POST http://localhost:3000/api/admin/payments/PAYMENT_ID/refund \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "requested_by_customer",
    "notes": "Customer changed their mind"
  }'

# Partial refund
curl -b cookies.txt -X POST http://localhost:3000/api/admin/payments/PAYMENT_ID/refund \
  -H "Content-Type: application/json" \
  -d '{
    "amount_cents": 5000,
    "reason": "requested_by_customer",
    "notes": "Partial refund due to issue"
  }'
```

### Dashboard API

#### Get Dashboard Stats
```bash
curl -b cookies.txt http://localhost:3000/api/admin/dashboard/stats
```

## Testing Workflow Examples

### Complete Client Onboarding Flow

```bash
# 1. Create client
CLIENT_RESPONSE=$(curl -s -b cookies.txt -X POST http://localhost:3000/api/admin/clients \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newclient@example.com",
    "name": "New Client",
    "company": "New Corp"
  }')

CLIENT_ID=$(echo $CLIENT_RESPONSE | jq -r '.data.client.id')

# 2. Create project
PROJECT_RESPONSE=$(curl -s -b cookies.txt -X POST http://localhost:3000/api/admin/projects \
  -H "Content-Type: application/json" \
  -d "{
    \"client_id\": \"$CLIENT_ID\",
    \"name\": \"Initial Website\",
    \"status\": \"PLANNING\",
    \"budget_cents\": 500000
  }")

# 3. Create subscription
curl -b cookies.txt -X POST http://localhost:3000/api/admin/subscriptions/create \
  -H "Content-Type: application/json" \
  -d "{
    \"client_id\": \"$CLIENT_ID\",
    \"price_id\": \"price_1234567890\",
    \"product_type\": \"MAINTENANCE_PRO\",
    \"trial_days\": 14
  }"

# 4. View client details
curl -s -b cookies.txt "http://localhost:3000/api/admin/clients/$CLIENT_ID" | jq
```

### Payment Refund Flow

```bash
# 1. Find payment
PAYMENTS=$(curl -s -b cookies.txt "http://localhost:3000/api/admin/payments?client_id=CLIENT_ID&status=SUCCEEDED")
PAYMENT_ID=$(echo $PAYMENTS | jq -r '.data.payments[0].id')

# 2. Refund payment
curl -b cookies.txt -X POST "http://localhost:3000/api/admin/payments/$PAYMENT_ID/refund" \
  -H "Content-Type: application/json" \
  -d '{
    "amount_cents": 5000,
    "reason": "requested_by_customer",
    "notes": "Customer request"
  }'

# 3. Verify refund
curl -s -b cookies.txt "http://localhost:3000/api/admin/payments/$PAYMENT_ID" | jq
```

## Error Testing

### Test Authentication
```bash
# Without session cookie - should return 401
curl http://localhost:3000/api/admin/clients
```

### Test Validation
```bash
# Invalid email
curl -b cookies.txt -X POST http://localhost:3000/api/admin/clients \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid", "name": "Test"}'

# Missing required fields
curl -b cookies.txt -X POST http://localhost:3000/api/admin/clients \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Test Business Logic
```bash
# Try to delete client that doesn't exist - should return 404
curl -b cookies.txt -X DELETE http://localhost:3000/api/admin/clients/invalid_id

# Try to refund non-existent payment - should return 404
curl -b cookies.txt -X POST http://localhost:3000/api/admin/payments/invalid_id/refund \
  -H "Content-Type: application/json" \
  -d '{"reason": "requested_by_customer"}'
```

## Automated Testing with Jest

### Example Test Suite

```typescript
// __tests__/api/admin/clients.test.ts
import { POST, GET, PUT, DELETE } from '@/app/api/admin/clients/route';

describe('Clients API', () => {
  beforeEach(() => {
    // Mock authentication
    jest.mock('@/lib/auth/middleware', () => ({
      requireAuthFromCookies: jest.fn().mockResolvedValue({
        id: 'admin_id',
        email: 'admin@example.com',
        name: 'Admin User',
      }),
    }));
  });

  describe('POST /api/admin/clients', () => {
    it('should create a new client', async () => {
      const request = new Request('http://localhost:3000/api/admin/clients', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test Client',
          company: 'Test Corp',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.client.email).toBe('test@example.com');
    });

    it('should return 400 for invalid email', async () => {
      const request = new Request('http://localhost:3000/api/admin/clients', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid',
          name: 'Test Client',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});
```

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test list endpoint performance
ab -n 1000 -c 10 -C "session_cookie=..." http://localhost:3000/api/admin/clients

# Test dashboard stats performance
ab -n 100 -c 5 -C "session_cookie=..." http://localhost:3000/api/admin/dashboard/stats
```

## Monitoring Activity Logs

```sql
-- View recent admin activity
SELECT
  al.action,
  al.entity_type,
  al.entity_id,
  au.name as admin_name,
  al.created_at,
  al.details
FROM activity_log al
JOIN admin_users au ON au.id = al.admin_id
ORDER BY al.created_at DESC
LIMIT 20;

-- View activity for specific client
SELECT *
FROM activity_log
WHERE client_id = 'CLIENT_ID'
ORDER BY created_at DESC;
```

## Best Practices

1. **Always Login First:** Get session cookie before testing other endpoints
2. **Use Stripe Test Mode:** Never test with live Stripe keys
3. **Clean Up Test Data:** Delete test clients/projects after testing
4. **Check Activity Logs:** Verify all actions are logged correctly
5. **Test Error Cases:** Don't just test happy paths
6. **Verify Stripe Webhooks:** Ensure webhooks update database correctly
7. **Test Pagination:** Try different page sizes and offsets
8. **Monitor Performance:** Check response times under load

## Troubleshooting

### 401 Unauthorized
- Session cookie missing or expired
- Login again to get fresh cookie

### 400 Bad Request
- Check request body format
- Validate all required fields present
- Check field types match schema

### 404 Not Found
- Verify entity ID exists
- Check spelling of endpoint URL

### 500 Internal Server Error
- Check server logs for detailed error
- Verify database connection
- Check Stripe API key validity

---

**See Also:**
- [Full API Reference](./ADMIN-API-REFERENCE.md)
- [Quick Reference](./ADMIN-API-QUICK-REFERENCE.md)
- [Implementation Summary](./ADMIN-API-IMPLEMENTATION-SUMMARY.md)
