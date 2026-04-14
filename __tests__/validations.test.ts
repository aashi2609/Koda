import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { profileSchema, swapRequestSchema, swapStatusSchema } from "@/lib/validations";

// ─── 9.2 Bio character limit (property-based) ───────────────────────────────
describe("bio character limit", () => {
  it("accepts any bio up to 500 chars", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 500 }), (bio) => {
        const result = profileSchema.safeParse({
          bio,
          skillsOffered: ["A"],
          skillsDesired: ["B"],
        });
        expect(result.success).toBe(true);
      })
    );
  });

  it("rejects bio longer than 500 chars", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 501, maxLength: 600 }), (bio) => {
        const result = profileSchema.safeParse({
          bio,
          skillsOffered: ["A"],
          skillsDesired: ["B"],
        });
        expect(result.success).toBe(false);
      })
    );
  });
});

// ─── 9.3 Message character limit (property-based) ───────────────────────────
describe("message character limit", () => {
  it("accepts any message up to 1000 chars", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 1000 }), (message) => {
        const result = swapRequestSchema.safeParse({
          receiverId: "abc123",
          message,
        });
        expect(result.success).toBe(true);
      })
    );
  });

  it("rejects message longer than 1000 chars", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1001, maxLength: 1100 }), (message) => {
        const result = swapRequestSchema.safeParse({
          receiverId: "abc123",
          message,
        });
        expect(result.success).toBe(false);
      })
    );
  });
});

// ─── 9.8 Skills array validation ────────────────────────────────────────────
describe("skills array validation", () => {
  it("rejects profile with empty skillsOffered", () => {
    const result = profileSchema.safeParse({
      bio: "Hello",
      skillsOffered: [],
      skillsDesired: ["React"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects profile with empty skillsDesired", () => {
    const result = profileSchema.safeParse({
      bio: "Hello",
      skillsOffered: ["Node.js"],
      skillsDesired: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts profile with at least one skill in each array", () => {
    const result = profileSchema.safeParse({
      bio: "Hello",
      skillsOffered: ["Node.js"],
      skillsDesired: ["React"],
    });
    expect(result.success).toBe(true);
  });
});

// ─── 9.9 Status transition validation ───────────────────────────────────────
describe("swap status schema", () => {
  it("accepts accepted", () => {
    expect(swapStatusSchema.safeParse({ status: "accepted" }).success).toBe(true);
  });

  it("accepts rejected", () => {
    expect(swapStatusSchema.safeParse({ status: "rejected" }).success).toBe(true);
  });

  it("rejects pending", () => {
    expect(swapStatusSchema.safeParse({ status: "pending" }).success).toBe(false);
  });

  it("rejects arbitrary strings", () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => s !== "accepted" && s !== "rejected"),
        (status) => {
          expect(swapStatusSchema.safeParse({ status }).success).toBe(false);
        }
      )
    );
  });
});
