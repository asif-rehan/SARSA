import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";

/**
 * Server-side permission checking utilities
 */

// Check if current user has admin permissions
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

// Check specific user permissions server-side
export async function checkUserPermission(
  userId: string, 
  resource: "user" | "session", 
  action: string
) {
  return await auth.api.userHasPermission({
    body: {
      userId,
      permissions: {
        [resource]: [action]
      }
    }
  });
}

// Check role permissions server-side
export async function checkRolePermission(
  role: string,
  resource: "user" | "session", 
  action: string
) {
  return await auth.api.userHasPermission({
    body: {
      role,
      permissions: {
        [resource]: [action]
      }
    }
  });
}

/**
 * Client-side permission checking utilities
 */

// Check if current user has specific permissions (client-side)
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

// Check if user can perform admin actions
export async function canManageUsers() {
  return await hasPermission("user", ["list", "create", "set-role"]);
}

export async function canBanUsers() {
  return await hasPermission("user", ["ban"]);
}

export async function canImpersonateUsers() {
  return await hasPermission("user", ["impersonate"]);
}

export async function canManageSessions() {
  return await hasPermission("session", ["list", "revoke"]);
}