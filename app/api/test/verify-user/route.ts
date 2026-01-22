import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

/**
 * Test Helper Endpoint: Verify User Email
 * 
 * This endpoint is ONLY for testing purposes to simulate email verification.
 * In production, users would click a verification link sent to their email.
 * 
 * REFACTOR PHASE: Improved error handling and validation
 */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  // Only allow in development/test environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoints not available in production' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { userId } = body;

    // Validate input
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { 
          error: 'Invalid request', 
          message: 'userId must be a non-empty string' 
        },
        { status: 400 }
      );
    }

    // Update user to mark email as verified
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE "user" SET "emailVerified" = true, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
        [userId]
      );
      
      if (result.rowCount === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'User email verified successfully',
        userId 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: 'Failed to verify user email' 
      },
      { status: 500 }
    );
  }
}