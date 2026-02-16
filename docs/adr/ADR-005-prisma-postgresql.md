# ADR-005: Prisma ORM with PostgreSQL

## Status
Accepted

## Context
The application requires a robust database solution for managing:
- Client information and relationships
- Subscription billing records
- Project tracking and management
- Payment history and invoicing
- Admin user authentication
- Activity logging and audit trails

Requirements included:
- Strong data consistency and ACID compliance
- Type-safe database access from TypeScript
- Migration management and version control
- Efficient query performance
- Developer-friendly API
- Support for complex relationships and transactions

## Decision
Adopt Prisma ORM with PostgreSQL as the database layer.

Implementation includes:
- PostgreSQL 14+ as the relational database
- Prisma Client for type-safe database access
- Prisma Migrate for schema version control
- Prisma Studio for database inspection
- Connection pooling for production performance
- Comprehensive schema with indexes and relationships

## Consequences

### Positive
- **Type Safety**: Prisma generates TypeScript types from schema, ensuring compile-time safety
- **Developer Experience**: Intuitive API with autocomplete and inline documentation
- **Migration Management**: Declarative schema with automatic migration generation
- **Data Modeling**: Clear, readable schema definition language
- **Query Performance**: Efficient query generation with automatic joins and indexes
- **Relationship Handling**: First-class support for relations with automatic cascade deletes
- **Database Introspection**: Can generate schema from existing databases
- **Prisma Studio**: Built-in GUI for database inspection and debugging
- **Transaction Support**: Built-in transaction API with rollback capabilities
- **PostgreSQL Features**: Access to advanced PostgreSQL features (JSONB, full-text search, etc.)

### Negative
- **Bundle Size**: Prisma Client adds ~3MB to node_modules (but not to client bundle)
- **Query Limitations**: Some advanced SQL patterns require raw queries
- **Learning Curve**: Schema definition language requires learning new syntax
- **Build Step**: Requires running prisma generate after schema changes
- **Vendor Lock-in**: Switching ORMs would require significant refactoring
- **Migration Complexity**: Complex schema changes may require manual migration editing

### Neutral
- **Abstraction Layer**: ORM abstraction provides benefits but hides some SQL details
- **Schema-First**: Schema must be defined in Prisma schema language (not database-first)
- **Client Size**: Generated Prisma Client can be large for complex schemas

## Alternatives Considered

### 1. TypeORM
**Why Not Chosen**:
- Less mature TypeScript integration
- ActiveRecord pattern less intuitive than Prisma's approach
- Decorator-based syntax increases complexity
- Weaker migration management
- Less performant query generation

### 2. Sequelize
**Why Not Chosen**:
- JavaScript-first (TypeScript support is secondary)
- Complex API with many ways to do the same thing
- Weak TypeScript type inference
- Older codebase with technical debt
- Less intuitive relationship handling

### 3. Knex.js
**Why Not Chosen**:
- Low-level query builder requires more boilerplate
- No automatic type generation
- Manual migration management more error-prone
- No relationship modeling
- More SQL knowledge required

### 4. Raw SQL with pg
**Why Not Chosen**:
- No type safety
- Manual query construction error-prone
- SQL injection risks if not careful
- No migration management
- More boilerplate code required

### 5. Drizzle ORM
**Why Not Chosen**:
- Newer library with smaller ecosystem
- Less documentation and community support
- While promising, Prisma is more battle-tested
- Fewer tooling integrations

## References
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Database Migration Strategies](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate)

## Implementation Notes

### Schema Architecture
```prisma
// Client Management
model Client {
  id                 String   @id @default(cuid())
  email              String   @unique
  subscriptions      Subscription[]
  projects           Project[]
  payments           Payment[]

  @@index([email])
  @@map("clients")
}

// With proper indexes for query optimization
@@index([client_id])
@@index([status])
```

### Key Design Decisions

#### 1. ID Strategy
- **CUID**: Collision-resistant unique IDs (better than UUID for database performance)
- Globally unique without coordination
- URL-safe and sortable by creation time

#### 2. Cascade Deletes
```prisma
client Client @relation(fields: [client_id], references: [id], onDelete: Cascade)
```
- Automatic cleanup of related records
- Prevents orphaned data
- Simplifies deletion logic

#### 3. Index Strategy
- Index foreign keys for join performance
- Index frequently queried fields (email, status, dates)
- Composite indexes where appropriate

#### 4. Enum Types
```prisma
enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  CANCELED
  REFUNDED
}
```
- Type-safe status values
- Database-level constraints
- Clear documentation of valid states

### Connection Management
```typescript
// lib/db.ts - Singleton pattern
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Migration Workflow
```bash
# Development workflow
npm run db:generate  # Generate Prisma Client
npm run db:migrate   # Create and apply migration
npm run db:studio    # Open Prisma Studio

# Production workflow
npx prisma migrate deploy  # Apply migrations in production
```

### Performance Optimizations
1. **Connection Pooling**: Configure PostgreSQL connection pool size
2. **Select Fields**: Use `select` to fetch only needed fields
3. **Batch Operations**: Use `createMany`, `updateMany` for bulk operations
4. **Transactions**: Group related operations in transactions
5. **Indexes**: Strategic indexes on frequently queried fields

### Security Considerations
- Parameterized queries prevent SQL injection
- Connection string stored in environment variables
- Database user has minimal required permissions
- Regular backups of production database
- Audit logging for sensitive operations
