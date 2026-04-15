import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";

/**
 * Authentication middleware for API routes
 * Returns the session if authenticated, or a 401 response if not
 */
export async function requireAuth(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _req: NextRequest
): Promise<{ session: Session } | NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return { session };
}

/**
 * Type guard to check if the result is a NextResponse (error case)
 */
export function isErrorResponse(
  result: { session: Session } | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
