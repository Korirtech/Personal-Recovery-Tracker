import { describe, expect, it } from "vitest";
import { getRecoveryEntitlements } from "./entitlements";

describe("getRecoveryEntitlements", () => {
  it("keeps the free plan focused on core daily tracking", () => {
    expect(getRecoveryEntitlements("free")).toEqual({
      plan: "free",
      dailyCheckins: true,
      basicDashboard: true,
      sevenDayHistory: true,
      extendedHistory: false,
      advancedAnalytics: false,
      aiInsights: false,
      dataExport: false,
    });
  });

  it("unlocks only the intended Pro capabilities", () => {
    const entitlements = getRecoveryEntitlements("pro");
    expect(entitlements.aiInsights).toBe(true);
    expect(entitlements.extendedHistory).toBe(true);
    expect(entitlements.advancedAnalytics).toBe(true);
    expect(entitlements.dataExport).toBe(true);
  });
});
