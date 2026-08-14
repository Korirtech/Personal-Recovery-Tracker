import { describe, expect, it } from "vitest";
import {
  getLocalDateKey,
  isValidTimeZone,
  localDateToDatabaseDate,
} from "./timezone";

describe("RecoveryLog timezone handling", () => {
  it("anchors a check-in to the calendar date in the user’s saved timezone", () => {
    const instant = new Date("2026-08-14T00:30:00.000Z");

    expect(getLocalDateKey("America/Los_Angeles", instant)).toBe("2026-08-13");
    expect(getLocalDateKey("Africa/Nairobi", instant)).toBe("2026-08-14");
  });

  it("accepts IANA timezones and rejects invalid values", () => {
    expect(isValidTimeZone("Europe/London")).toBe(true);
    expect(isValidTimeZone("Invalid/Timezone")).toBe(false);
  });

  it("uses a stable UTC date object for database comparisons", () => {
    expect(localDateToDatabaseDate("2026-08-14").toISOString()).toBe(
      "2026-08-14T00:00:00.000Z"
    );
  });
});
