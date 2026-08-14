import { describe, expect, it } from "vitest";
import { buildAnalyticsProjection } from "./analytics";

describe("buildAnalyticsProjection", () => {
  it("calculates aggregates, a consecutive streak, and comparison only from provided records", () => {
    const projection = buildAnalyticsProjection(
      [
        { localDate: new Date("2026-06-19T00:00:00.000Z"), recoveryScore: 40 },
        { localDate: new Date("2026-08-12T00:00:00.000Z"), recoveryScore: 60 },
        { localDate: new Date("2026-08-13T00:00:00.000Z"), recoveryScore: 70 },
        { localDate: new Date("2026-08-14T00:00:00.000Z"), recoveryScore: 80 },
      ],
      "2026-08-14"
    );

    expect(projection.overview).toMatchObject({
      average: 70,
      highest: 80,
      lowest: 60,
      checkins: 3,
      streak: 3,
      previousPeriodDifference: 30,
    });
    expect(projection.trend).toHaveLength(3);
  });
});
