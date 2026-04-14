/**
 * EXAMPLE: Protected API Route Template
 * 
 * This file demonstrates how to create a protected API route
 * using the authentication middleware.
 * 
 * Copy this pattern when creating new protected API routes.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/apiAuth";

/**
 * Example GET handler for a protected route
 */
export async function GET(req: NextRequest) {
  try {
    // Step 1: Check authentication
    const authResult = await requireAuth(req);
    if (isErrorResponse(authResult)) {
      return authResult; // Returns 401 Unauthorized
    }

    // Step 2: Extract session
    const { session } = authResult;

    // Step 3: Your business logic here
    // You can access:
    // - session.user.id
    // - session.user.email
    // - session.user.name
    // - session.user.image

    // Example: Return user-specific data
    return NextResponse.json({
      message: "Success",
      userId: session.user.id,
      userEmail: session.user.email,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Example POST handler for a protected route
 */
export async function POST(req: NextRequest) {
  try {
    // Step 1: Check authentication
    const authResult = await requireAuth(req);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { session } = authResult;

    // Step 2: Parse and validate request body
    const body = await req.json();
    
    // Add your validation here
    if (!body.someField) {
      return NextResponse.json(
        { error: "someField is required" },
        { status: 400 }
      );
    }

    // Step 3: Your business logic here
    // Process the request using session.user data

    return NextResponse.json({
      message: "Created successfully",
      userId: session.user.id,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Example PATCH handler for a protected route
 */
export async function PATCH(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { session } = authResult;
    const body = await req.json();

    // Your update logic here

    return NextResponse.json({
      message: "Updated successfully",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Example DELETE handler for a protected route
 */
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { session } = authResult;

    // Your delete logic here
    // Make sure to verify the user has permission to delete the resource

    return NextResponse.json({
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
