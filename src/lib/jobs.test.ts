import { describe, expect, it } from "vitest";
import { JOBS, daysLeft, matchScore } from "./jobs";

const fe = JOBS.find((j) => j.slug === "frontend-developer-intern-brightlane")!;

describe("job matching", () => {
  it("scores the share of a job's skills the student has, case-insensitively", () => {
    expect(matchScore(fe, ["react", "TypeScript"])).toBe(67);
    expect(matchScore(fe, [])).toBe(0);
    expect(matchScore(fe, ["React", "TypeScript", "CSS"])).toBe(100);
  });
  it("counts days left until the deadline day ends", () => {
    expect(daysLeft(fe, new Date("2026-12-11T10:00:00"))).toBe(1);
    expect(daysLeft(fe, new Date("2026-12-12T10:00:00"))).toBeLessThanOrEqual(0);
  });
});
