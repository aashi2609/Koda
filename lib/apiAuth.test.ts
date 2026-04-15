import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock next-auth and lib/auth before importing requireAuth
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { getServerSession } from "next-auth";
import { requireAuth, isErrorResponse } from "./apiAuth";

describe("requireAuth middleware", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when no session exists", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/test");
    const result = await requireAuth(req);
    expect(isErrorResponse(result)).toBe(true);
    if (isErrorResponse(result)) expect(result.status).toBe(401);
  });

  it("returns 401 when session has no user", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ expires: "2099-01-01" } as { expires: string; user: undefined });
    const req = new NextRequest("http://localhost/api/test");
    const result = await requireAuth(req);
    expect(isErrorResponse(result)).toBe(true);
  });

  it("returns session when authenticated", async () => {
    const mockSession = {
      user: { id: "u1", email: "a@b.com", name: "Test" },
      expires: "2099-01-01",
    };
    vi.mocked(getServerSession).mockResolvedValue(mockSession as { expires: string; user: { id: string; email: string; name: string } });
    const req = new NextRequest("http://localhost/api/test");
    const result = await requireAuth(req);
    expect(isErrorResponse(result)).toBe(false);
    if (!isErrorResponse(result)) {
      expect(result.session.user.email).toBe("a@b.com");
    }
  });
});
