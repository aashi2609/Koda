import { describe, it, expect, vi, beforeAll } from "vitest";

// Provide env vars before any module import
beforeAll(() => {
  process.env.MONGODB_URI = "mongodb://localhost:27017/test";
  process.env.NEXTAUTH_SECRET = "test-secret";
  process.env.GITHUB_CLIENT_ID = "gh-id";
  process.env.GITHUB_CLIENT_SECRET = "gh-secret";
  process.env.GOOGLE_CLIENT_ID = "g-id";
  process.env.GOOGLE_CLIENT_SECRET = "g-secret";
});

// ─── 9.1 Auth.js provider configuration ─────────────────────────────────────
describe("Auth.js provider configuration", () => {
  it("authOptions has both github and google providers", async () => {
    const { authOptions } = await import("@/lib/auth");
    expect(Array.isArray(authOptions.providers)).toBe(true);
    const ids = authOptions.providers.map((p: any) => p.id);
    expect(ids).toContain("github");
    expect(ids).toContain("google");
  });
});
