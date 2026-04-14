# API Authentication Middleware

## Overview

The `apiAuth.ts` module provides authentication middleware for protecting API routes in the Koda platform. It ensures that only authenticated users can access protected endpoints, returning a 401 Unauthorized response for unauthenticated requests.

## Usage

### Basic Usage

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  // Check authentication
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) {
    return authResult; // Returns 401 Unauthorized
  }
  
  // Access the authenticated session
  const { session } = authResult;
  
  // Your protected route logic here
  return NextResponse.json({
    message: "Success",
    userId: session.user.id,
  });
}
```

### Accessing User Information

The session object contains the authenticated user's information:

```typescript
const { session } = authResult;

// Available user properties:
session.user.id      // User ID
session.user.email   // User email
session.user.name    // User name
session.user.image   // User profile image
```

### Example: Protected POST Route

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  // Authenticate the request
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  
  const { session } = authResult;
  
  // Parse request body
  const body = await req.json();
  
  // Your business logic here
  // ...
  
  return NextResponse.json({ success: true });
}
```

## API Reference

### `requireAuth(req: NextRequest)`

Checks if the request has a valid authentication session.

**Parameters:**
- `req`: The Next.js request object

**Returns:**
- `{ session: Session }` if authenticated
- `NextResponse` with 401 status if not authenticated

### `isErrorResponse(result)`

Type guard to check if the authentication result is an error response.

**Parameters:**
- `result`: The result from `requireAuth()`

**Returns:**
- `true` if the result is a NextResponse (error case)
- `false` if the result contains a valid session

## Implementation Details

The middleware uses NextAuth.js's `getServerSession()` to verify authentication. It checks for:
1. Valid session existence
2. User object presence in the session

If either check fails, it returns a standardized 401 Unauthorized response with the error message "Unauthorized".

## Requirements Satisfied

This middleware satisfies **Requirement 10, Acceptance Criterion 5**:
> WHEN an API route receives a request without valid authentication, THE Koda_Platform SHALL return a 401 Unauthorized response
