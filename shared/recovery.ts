export const MOOD_VALUES = ["good", "okay", "low"] as const;
export type Mood = (typeof MOOD_VALUES)[number];

export const RECOVERY_CATEGORIES = [
  "excellent",
  "good",
  "moderate",
  "low",
] as const;
export type RecoveryCategory = (typeof RECOVERY_CATEGORIES)[number];

export function getRecoveryCategory(score: number): RecoveryCategory {
  if (score >= 80) return "excellent";
  if (score >= 65) return "good";
  if (score >= 50) return "moderate";
  return "low";
}

export type RecoveryInputs = {
  sleepQuality: number;
  energy: number;
  stress: number;
  soreness: number;
  mood: Mood;
};

export type RecoveryScoreResult = {
  score: number;
  category: RecoveryCategory;
  components: {
    sleep: number;
    energy: number;
    stress: number;
    soreness: number;
    mood: number;
  };
};

export type InsightPayload = {
  title: string;
  observation: string;
  evidence: string;
  confidence: "low" | "moderate" | "high";
};

export type SubscriptionPlan = "free" | "pro";
