import { describe, expect, it } from "vitest";
import { calculateRecoveryScore } from "./score";
import { getRecoveryCategory } from "../../shared/recovery";

describe("calculateRecoveryScore", () => {
  it("calculates the maximum score from maximum positive and minimum reverse-scored inputs", () => {
    expect(
      calculateRecoveryScore({
        sleepQuality: 5,
        energy: 5,
        stress: 1,
        soreness: 1,
        mood: "good",
      })
    ).toMatchObject({
      score: 100,
      category: "excellent",
      components: {
        sleep: 100,
        energy: 100,
        stress: 100,
        soreness: 100,
        mood: 100,
      },
    });
  });

  it("reverse-scores stress and soreness", () => {
    const lowStress = calculateRecoveryScore({
      sleepQuality: 1,
      energy: 1,
      stress: 1,
      soreness: 5,
      mood: "low",
    });
    const highStress = calculateRecoveryScore({
      sleepQuality: 1,
      energy: 1,
      stress: 5,
      soreness: 5,
      mood: "low",
    });
    const lowSoreness = calculateRecoveryScore({
      sleepQuality: 1,
      energy: 1,
      stress: 5,
      soreness: 1,
      mood: "low",
    });

    expect(lowStress.components.stress).toBe(100);
    expect(highStress.components.stress).toBe(0);
    expect(lowStress.score).toBeGreaterThan(highStress.score);
    expect(lowSoreness.components.soreness).toBe(100);
    expect(lowSoreness.score).toBeGreaterThan(highStress.score);
  });

  it("maps mood values and uses the documented weighted formula", () => {
    const result = calculateRecoveryScore({
      sleepQuality: 3,
      energy: 3,
      stress: 3,
      soreness: 3,
      mood: "okay",
    });

    expect(result.components).toEqual({
      sleep: 50,
      energy: 50,
      stress: 50,
      soreness: 50,
      mood: 60,
    });
    expect(result.score).toBe(51);
    expect(result.category).toBe("moderate");
  });
});

describe("getRecoveryCategory", () => {
  it("keeps category boundaries deterministic", () => {
    expect(getRecoveryCategory(100)).toBe("excellent");
    expect(getRecoveryCategory(80)).toBe("excellent");
    expect(getRecoveryCategory(79)).toBe("good");
    expect(getRecoveryCategory(65)).toBe("good");
    expect(getRecoveryCategory(64)).toBe("moderate");
    expect(getRecoveryCategory(50)).toBe("moderate");
    expect(getRecoveryCategory(49)).toBe("low");
    expect(getRecoveryCategory(0)).toBe("low");
  });
});
