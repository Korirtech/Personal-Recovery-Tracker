import type { SubscriptionPlan } from "../../shared/recovery";

export type DataExportStatus = {
  eligible: boolean;
  status: "not_eligible" | "provider_not_configured";
  supportedFormats: Array<"csv" | "json">;
  scope: Array<
    "profile" | "daily_checkins" | "insights" | "notification_preferences"
  >;
};

/**
 * Provider-independent boundary for a future Pro export workflow. A later
 * asynchronous exporter can use this contract to create a job, store a short-
 * lived download in object storage, and expose only the user-owned artifact.
 */
export function getDataExportStatus(plan: SubscriptionPlan): DataExportStatus {
  const eligible = plan === "pro";
  return {
    eligible,
    status: eligible ? "provider_not_configured" : "not_eligible",
    supportedFormats: ["csv", "json"],
    scope: [
      "profile",
      "daily_checkins",
      "insights",
      "notification_preferences",
    ],
  };
}
