import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ─── 9.4 User filtering (property-based) ────────────────────────────────────

interface User {
  id: string;
  name: string;
  skillsOffered: string[];
  skillsDesired: string[];
}

function filterUsersBySkill(users: User[], skill: string): User[] {
  if (!skill) return users;
  return users.filter((u) =>
    u.skillsOffered.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
  );
}

const userArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  skillsOffered: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
  skillsDesired: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
});

describe("user skill filtering", () => {
  it("every returned user has the searched skill in skillsOffered", () => {
    fc.assert(
      fc.property(
        fc.array(userArb, { minLength: 0, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (users, skill) => {
          const filtered = filterUsersBySkill(users, skill);
          return filtered.every((u) =>
            u.skillsOffered.some((s) =>
              s.toLowerCase().includes(skill.toLowerCase())
            )
          );
        }
      )
    );
  });

  it("empty filter returns all users", () => {
    fc.assert(
      fc.property(fc.array(userArb, { minLength: 0, maxLength: 20 }), (users) => {
        expect(filterUsersBySkill(users, "").length).toBe(users.length);
      })
    );
  });
});
