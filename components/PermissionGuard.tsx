"use client";

import { useState, useEffect, ReactNode } from "react";
import { hasPermission } from "@/lib/permissions";

interface PermissionGuardProps {
  resource: "user" | "session";
  actions: string[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission.
}

export default function PermissionGuard({
  resource,
  actions,
  children,
  fallback = null,
  requireAll = true,
}: PermissionGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAccess() {
      try {
        if (requireAll) {
          // Check if user has ALL required permissions
          const result = await hasPermission(resource, actions);
          setHasAccess(result);
        } else {
          // Check if user has ANY of the required permissions
          const results = await Promise.all(
            actions.map(action => hasPermission(resource, [action]))
          );
          setHasAccess(results.some(result => result));
        }
      } catch (error) {
        console.error("Permission check failed:", error);
        setHasAccess(false);
      }
    }

    checkAccess();
  }, [resource, actions, requireAll]);

  // Loading state
  if (hasAccess === null) {
    return <div className="animate-pulse bg-muted h-8 rounded" />;
  }

  // Show content if user has permission, otherwise show fallback
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Convenience components for common permission checks
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard resource="user" actions={["list"]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function CanBanUsers({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard resource="user" actions={["ban"]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function CanManageUsers({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard resource="user" actions={["create", "list", "set-role"]} requireAll={false} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}