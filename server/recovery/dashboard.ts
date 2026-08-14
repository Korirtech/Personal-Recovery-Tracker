import type { DailyCheckin } from "../../drizzle/schema";
import { getRecoveryCategory } from "../../shared/recovery";

function toLocalDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function getDailySuggestion(score: number) {
  const category = getRecoveryCategory(score);

  const suggestions = {
    excellent:
      "Your personal recovery indicator is looking strong today. Consider maintaining the routine that feels right for you.",
    good: "Your personal recovery indicator is looking good today. Consider keeping your routine steady and checking in with how you feel.",
    moderate:
      "Your personal recovery indicator is moderate today. Consider keeping your routine manageable and paying attention to how you feel.",
    low: "Your personal recovery indicator is lower today. Consider prioritizing rest and monitoring how you feel.",
  } as const;

  return suggestions[category];
}

export function buildDashboardProjection(
  today: DailyCheckin | null,
  recentEntries: DailyCheckin[]
) {
  const trend = [...recentEntries].reverse().map(entry => ({
    date: toLocalDateKey(entry.localDate),
    score: entry.recoveryScore,
  }));

  if (!today) {
    return { today: null, trend, suggestion: null };
  }

  return {
    today: {
      score: today.recoveryScore,
      category: getRecoveryCategory(today.recoveryScore),
      metrics: {
        sleep: today.sleepQuality * 2,
        energy: today.energy * 2,
        stress: (6 - today.stress) * 2,
        soreness: (6 - today.soreness) * 2,
      },
    },
    trend,
    suggestion: getDailySuggestion(today.recoveryScore),
  };
}
