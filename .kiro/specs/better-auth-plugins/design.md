# Better-Auth Plugins Integration Design

## Architecture Overview

This document outlines the design for integrating Better-Auth plugins to enhance authentication functionality while maintaining security, performance, and maintainability.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
├─────────────────────────────────────────────────────────────┤
│  React Components  │  Admin Dashboard  │  Permission Guards │
│  - EmailPasswordForm│  - AdminDashboard │  - PermissionGuard│
│  - PasskeyAuth     │  - UserManagement │  - RoleGuard      │
│  - StripeCheckout  │  - RoleEditor     │  - AdminGuard     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Auth Client Layer                           │
├─────────────────────────────────────────────────────────────┤
│  authClient (better-auth/client)                           │
│  ├── stripeClient()    - Stripe operations                 │
│  ├── passkeyClient()   - Passkey authentication           │
│  └── admin.*           - Admin operations (server-provided)│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Server Layer                               │
├─────────────────────────────────────────────────────────────┤
│  Better-Auth Server (lib/auth.ts)                         │
│  ├── admin plugin      - User management, roles, banning  │
│  ├── passkey plugin    - WebAuthn passkey support         │
│  └── stripe plugin     - Payment integration              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Database Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Enhanced Schema with Plugin Tables:                      │
│  ├── user (enhanced)   - role, banned, banReason, etc.   │
│  ├── session (enhanced)- impersonatedBy                   │
│  ├── organization      - Multi-tenant support             │
│  ├── member           - Organization membership           │
│  ├── invitation       - Organization invites              │
│  ├── passkey          - WebAuthn credentials              │
│  └── twoFactor        - 2FA settings                      │
└─────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. Server-Side Plugin Configuration

#### File: `lib/auth.ts`
```typescript
// Core Better-Auth configuration with plugins
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [
    // Stripe integration for payments
    stripe({
      stripeClient: stripeInstance,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
    }),
    // Passkey authentication
    passkey({
      rpName: "SaaS Template",
      rpID: process.env.NEXT_PUBLIC_APP_URL?.replace(/https?:\/\//, '') || "localhost",
    }),
    // Admin functionality
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
});
```

#### Key Design Decisions:
- **Plugin Selection**: Only essential plugins to avoid complexity
- **Configuration**: Environment-based configuration for flexibility
- **Security**: Proper role-based access control

### 2. Client-Side Integration

#### File: `lib/auth-client.ts`
```typescript
// Client-side auth configuration
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    stripeClient(),    // Stripe operations
    passkeyClient(),   // Passkey authentication
    // Note: No admin client plugin - admin methods available via server
  ],
});
```

#### Key Design Decisions:
- **Client Plugins**: Only client-side plugins (Stripe, Passkey)
- **Admin Access**: Admin functionality accessed via server API
- **Type Safety**: Full TypeScript support for all operations

### 3. Permission System Design

#### File: `lib/permissions.ts`
```typescript
// Permission checking utilities
export async function requireAdmin(headers: Headers) {
  const session = await auth.api.getSession({ headers });
  
  if (!session) {
    throw new Error("Authentication required");
  }
  
  if (session.user.role !== "admin") {
    throw new Error("Admin access required");
  }
  
  return session;
}

// Client-side permission checks
export async function hasPermission(
  resource: "user" | "session",
  actions: string[]
) {
  try {
    const result = await authClient.admin.hasPermission({
      permissions: {
        [resource]: actions
      }
    });
    return result.data?.hasPermission || false;
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
}
```

#### Key Design Decisions:
- **Role-Based Access**: Simple role-based permission system
- **Server/Client Split**: Server-side validation, client-side UX
- **Granular Permissions**: Fine-grained permission control

### 4. Admin Dashboard Design

#### File: `app/admin/AdminDashboard.tsx`
```typescript
// Admin dashboard with user management
export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState({
    canManageUsers: false,
    canBanUsers: false,
    canImpersonateUsers: false,
    canManageSessions: false,
  });

  // Permission-based UI rendering
  return (
    <div className="container mx-auto px-4 py-8">
      {permissions.canManageUsers ? (
        <UserManagementInterface />
      ) : (
        <NoPermissionMessage />
      )}
    </div>
  );
}
```

#### Key Design Decisions:
- **Permission Guards**: All admin components protected by permissions
- **Modular Components**: Separate components for different admin functions
- **Responsive Design**: Mobile-friendly admin interface

### 5. Database Schema Design

#### Enhanced User Table
```sql
CREATE TABLE user (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  emailVerified BOOLEAN DEFAULT FALSE,
  name TEXT,
  image TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Admin plugin fields
  role TEXT DEFAULT 'user',
  banned BOOLEAN DEFAULT FALSE,
  banReason TEXT,
  banExpires DATETIME
);
```

#### Enhanced Session Table
```sql
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  expiresAt DATETIME NOT NULL,
  token TEXT UNIQUE NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Admin plugin field
  impersonatedBy TEXT,
  
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (impersonatedBy) REFERENCES user(id) ON DELETE SET NULL
);
```

#### New Plugin Tables
```sql
-- Passkey authentication
CREATE TABLE passkey (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  credentialID TEXT UNIQUE NOT NULL,
  publicKey TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Organization support
CREATE TABLE organization (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Organization membership
CREATE TABLE member (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  organizationId TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (organizationId) REFERENCES organization(id) ON DELETE CASCADE,
  UNIQUE(userId, organizationId)
);
```

## API Design

### Admin API Endpoints

#### User Management
```typescript
// List users with pagination and filtering
GET /api/auth/admin/users
Query: {
  limit?: number,
  offset?: number,
  search?: string,
  role?: string,
  banned?: boolean
}

// Set user role
POST /api/auth/admin/users/:id/role
Body: {
  role: string
}

// Ban user
POST /api/auth/admin/users/:id/ban
Body: {
  reason?: string,
  expiresIn?: number
}

// Unban user
DELETE /api/auth/admin/users/:id/ban
```

#### Impersonation
```typescript
// Start impersonation
POST /api/auth/admin/impersonate
Body: {
  userId: string
}

// Stop impersonation
POST /api/auth/admin/stop-impersonation
```

### Passkey API Endpoints

```typescript
// Register passkey
POST /api/auth/passkey/register
Body: {
  challenge: string,
  credential: PublicKeyCredential
}

// Authenticate with passkey
POST /api/auth/passkey/authenticate
Body: {
  challenge: string,
  credential: PublicKeyCredential
}

// List user passkeys
GET /api/auth/passkey/list

// Delete passkey
DELETE /api/auth/passkey/:id
```

## Security Design

### Authentication & Authorization

1. **Admin Access Control**
   - All admin operations require authentication
   - Role-based permission checking
   - Admin role validation on every request

2. **Impersonation Security**
   - Time-limited impersonation sessions
   - Audit logging for all impersonation events
   - Cannot impersonate other admins (configurable)

3. **Passkey Security**
   - WebAuthn standard compliance
   - Secure credential storage
   - Challenge-response authentication

### Input Validation

1. **Server-Side Validation**
   - All inputs validated using Better-Auth schemas
   - SQL injection prevention
   - XSS protection

2. **Client-Side Validation**
   - Form validation for better UX
   - Type safety with TypeScript
   - Real-time validation feedback

## Performance Design

### Database Optimization

1. **Indexing Strategy**
   ```sql
   -- User table indexes
   CREATE INDEX idx_user_email ON user(email);
   CREATE INDEX idx_user_role ON user(role);
   CREATE INDEX idx_user_banned ON user(banned);
   
   -- Session table indexes
   CREATE INDEX idx_session_userId ON session(userId);
   CREATE INDEX idx_session_token ON session(token);
   CREATE INDEX idx_session_expiresAt ON session(expiresAt);
   
   -- Passkey table indexes
   CREATE INDEX idx_passkey_userId ON passkey(userId);
   CREATE INDEX idx_passkey_credentialID ON passkey(credentialID);
   ```

2. **Query Optimization**
   - Pagination for large datasets
   - Efficient filtering and searching
   - Connection pooling

### Caching Strategy

1. **Permission Caching**
   - Cache user permissions for frequent checks
   - In-memory caching for development
   - TTL-based cache invalidation

2. **Session Caching**
   - Cache active sessions
   - Reduce database queries
   - Automatic cleanup of expired sessions

## Error Handling Design

### Error Categories

1. **Authentication Errors**
   - Invalid credentials
   - Expired sessions
   - Banned user attempts

2. **Authorization Errors**
   - Insufficient permissions
   - Invalid admin access
   - Role validation failures

3. **Validation Errors**
   - Invalid input data
   - Schema validation failures
   - Business rule violations

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
```

## Testing Strategy

### Unit Tests
- Permission utility functions
- Admin API endpoints
- Passkey authentication flows
- Error handling scenarios

### Integration Tests
- Plugin interactions
- Database operations
- Authentication flows
- Admin workflows

### E2E Tests
- Complete admin workflows
- Passkey registration and authentication
- User management scenarios
- Permission enforcement

## Monitoring & Logging

### Audit Logging
- All admin operations logged
- User impersonation events
- Permission changes
- Security events

### Performance Monitoring
- API response times
- Database query performance
- Authentication success rates
- Error rates and patterns

### Security Monitoring
- Failed authentication attempts
- Suspicious admin activities
- Rate limit violations
- Unauthorized access attempts

## Deployment Considerations

### Environment Configuration
- Separate configs for dev/staging/prod
- Secure secret management
- Database migration strategies
- Plugin version management

### Scalability
- Horizontal scaling support
- Database connection pooling
- Caching layer implementation
- Load balancer configuration

### Backup & Recovery
- Regular database backups
- Point-in-time recovery
- Disaster recovery procedures
- Data retention policies