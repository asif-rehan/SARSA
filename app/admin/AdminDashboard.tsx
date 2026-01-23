"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { canManageUsers, canBanUsers, canImpersonateUsers, canManageSessions } from "@/lib/permissions";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  banned: boolean;
  banReason?: string;
  createdAt: string;
}

interface AdminDashboardProps {
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    canManageUsers: false,
    canBanUsers: false,
    canImpersonateUsers: false,
    canManageSessions: false,
  });

  // Check permissions on component mount
  useEffect(() => {
    async function checkPermissions() {
      const [manageUsers, banUsers, impersonateUsers, manageSessions] = await Promise.all([
        canManageUsers(),
        canBanUsers(),
        canImpersonateUsers(),
        canManageSessions(),
      ]);

      setPermissions({
        canManageUsers: manageUsers,
        canBanUsers: banUsers,
        canImpersonateUsers: impersonateUsers,
        canManageSessions: manageSessions,
      });
    }

    checkPermissions();
  }, []);

  // Load users if user has permission
  useEffect(() => {
    async function loadUsers() {
      if (!permissions.canManageUsers) {
        setLoading(false);
        return;
      }

      try {
        const result = await authClient.admin.listUsers({
          query: {
            limit: 50,
            sortBy: "createdAt",
            sortDirection: "desc",
          },
        });

        if (result.data) {
          setUsers(result.data.users);
        }
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [permissions.canManageUsers]);

  const handleSetRole = async (userId: string, newRole: string) => {
    try {
      await authClient.admin.setRole({
        userId,
        role: newRole,
      });
      
      // Refresh users list
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (error) {
      console.error("Failed to set role:", error);
    }
  };

  const handleBanUser = async (userId: string, reason: string) => {
    if (!permissions.canBanUsers) return;

    try {
      await authClient.admin.banUser({
        userId,
        banReason: reason,
      });
      
      // Refresh users list
      setUsers(users.map(u => 
        u.id === userId ? { ...u, banned: true, banReason: reason } : u
      ));
    } catch (error) {
      console.error("Failed to ban user:", error);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!permissions.canBanUsers) return;

    try {
      await authClient.admin.unbanUser({ userId });
      
      // Refresh users list
      setUsers(users.map(u => 
        u.id === userId ? { ...u, banned: false, banReason: undefined } : u
      ));
    } catch (error) {
      console.error("Failed to unban user:", error);
    }
  };

  const handleImpersonateUser = async (userId: string) => {
    if (!permissions.canImpersonateUsers) return;

    try {
      await authClient.admin.impersonateUser({ userId });
      // Redirect to dashboard as the impersonated user
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Failed to impersonate user:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {user.name || user.email} - Managing {users.length} users
        </p>
      </div>

      {/* Permission Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Permissions</CardTitle>
          <CardDescription>Available admin actions based on your role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant={permissions.canManageUsers ? "default" : "secondary"}>
              Manage Users
            </Badge>
            <Badge variant={permissions.canBanUsers ? "default" : "secondary"}>
              Ban Users
            </Badge>
            <Badge variant={permissions.canImpersonateUsers ? "default" : "secondary"}>
              Impersonate Users
            </Badge>
            <Badge variant={permissions.canManageSessions ? "default" : "secondary"}>
              Manage Sessions
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Users Management */}
      {permissions.canManageUsers ? (
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((userItem) => (
                <div key={userItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{userItem.name || userItem.email}</span>
                      <Badge variant={userItem.role === "admin" ? "default" : "secondary"}>
                        {userItem.role}
                      </Badge>
                      {userItem.banned && (
                        <Badge variant="destructive">Banned</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{userItem.email}</p>
                    {userItem.banReason && (
                      <p className="text-sm text-red-600">Ban reason: {userItem.banReason}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Role Management */}
                    {userItem.id !== user.id && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetRole(
                            userItem.id, 
                            userItem.role === "admin" ? "user" : "admin"
                          )}
                        >
                          {userItem.role === "admin" ? "Remove Admin" : "Make Admin"}
                        </Button>

                        {/* Ban/Unban */}
                        {permissions.canBanUsers && (
                          <>
                            {userItem.banned ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnbanUser(userItem.id)}
                              >
                                Unban
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleBanUser(userItem.id, "Banned by admin")}
                              >
                                Ban
                              </Button>
                            )}
                          </>
                        )}

                        {/* Impersonate */}
                        {permissions.canImpersonateUsers && !userItem.banned && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleImpersonateUser(userItem.id)}
                          >
                            Impersonate
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You don't have permission to manage users.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}