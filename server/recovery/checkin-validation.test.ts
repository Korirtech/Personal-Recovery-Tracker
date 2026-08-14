import { describe, expect, it } from "vitest";
import { checkinInputSchema } from "../../shared/checkin";

const validCheckin = {
  sleepQuality: 3,
  energy: 3,
  stress: 3,
  soreness: 3,
  mood: "okay" as const,
  sleepDurationHours: 7.5,
};

describe("checkinInputSchema", () => {
  it("accepts valid ordinal responses and optional duration", () => {
    expect(checkinInputSchema.parse(validCheckin)).toEqual(validCheckin);
  });

  it("rejects invalid recovery response ranges, moods, and impossible duration", () => {
    expect(
      checkinInputSchema.safeParse({ ...validCheckin, sleepQuality: 0 }).success
    ).toBe(false);
    expect(
      checkinInputSchema.safeParse({ ...validCheckin, stress: 6 }).success
    ).toBe(false);
    expect(
      checkinInputSchema.safeParse({ ...validCheckin, mood: "great" }).success
    ).toBe(false);
    expect(
      checkinInputSchema.safeParse({
        ...validCheckin,
        sleepDurationHours: 24.5,
      }).success
    ).toBe(false);
  });
});
