import type { SubscriptionPlan } from "../../shared/recovery";

export type RecoveryEntitlements = {
  plan: SubscriptionPlan;
  dailyCheckins: true;
  basicDashboard: true;
  sevenDayHistory: true;
  extendedHistory: boolean;
  advancedAnalytics: boolean;
  aiInsights: boolean;
  dataExport: boolean;
};

export function getRecoveryEntitlements(
  plan: SubscriptionPlan
): RecoveryEntitlements {
  const isPro = plan === "pro";
  return {
    plan,
    dailyCheckins: true,
    basicDashboard: true,
    sevenDayHistory: true,
    extendedHistory: isPro,
    advancedAnalytics: isPro,
    aiInsights: isPro,
    dataExport: isPro,
  };
}
