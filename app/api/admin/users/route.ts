import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/permissions";
import { NextRequest } from "next/server";

// GET /api/admin/users - List users (requires admin permission)
export async function GET(request: NextRequest) {
  try {
    // Check admin permission
    const session = await requireAdmin(request.headers);
    
    // Use Better-Auth's built-in admin functionality
    const result = await auth.api.listUsers({
      query: {
        limit: request.nextUrl.searchParams.get("limit") || "50",
        offset: request.nextUrl.searchParams.get("offset") || "0",
        sortBy: request.nextUrl.searchParams.get("sortBy") || "createdAt",
        sortDirection: (request.nextUrl.searchParams.get("sortDirection") as "asc" | "desc") || "desc",
      },
      headers: request.headers,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Access denied" },
      { status: 403 }
    );
  }
}

// POST /api/admin/users - Create user (requires admin permission)
export async function POST(request: NextRequest) {
  try {
    // Check admin permission
    await requireAdmin(request.headers);
    
    const body = await request.json();
    const { email, password, name, role } = body;

    // Use Better-Auth's built-in admin functionality
    const result = await auth.api.createUser({
      body: {
        email,
        password,
        name,
        role: role || "user",
      },
      headers: request.headers,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create user" },
      { status: 400 }
    );
  }
}