import type { DailyCheckin } from "../../drizzle/schema";

type AnalyticsCheckin = Pick<
  DailyCheckin,
  | "localDate"
  | "recoveryScore"
  | "sleepQuality"
  | "energy"
  | "stress"
  | "soreness"
>;

function toLocalDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function daysBetween(later: string, earlier: string) {
  const laterTime = Date.parse(`${later}T00:00:00.000Z`);
  const earlierTime = Date.parse(`${earlier}T00:00:00.000Z`);
  return Math.round((laterTime - earlierTime) / 86_400_000);
}

export function buildAnalyticsProjection(
  entries: AnalyticsCheckin[],
  currentLocalDate: string
) {
  const sorted = [...entries].sort(
    (left, right) => left.localDate.getTime() - right.localDate.getTime()
  );
  const currentPeriod = sorted.filter(
    entry =>
      daysBetween(currentLocalDate, toLocalDateKey(entry.localDate)) <= 29
  );
  const previousPeriod = sorted.filter(entry => {
    const difference = daysBetween(
      currentLocalDate,
      toLocalDateKey(entry.localDate)
    );
    return difference >= 30 && difference <= 59;
  });
  const scores = currentPeriod.map(entry => entry.recoveryScore);
  const average = scores.length
    ? Math.round(
        scores.reduce((total, score) => total + score, 0) / scores.length
      )
    : null;

  let streak = 0;
  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    if (index === sorted.length - 1) {
      streak = 1;
      continue;
    }
    const current = toLocalDateKey(sorted[index].localDate);
    const next = toLocalDateKey(sorted[index + 1].localDate);
    if (daysBetween(next, current) === 1) streak += 1;
    else break;
  }

  const previousAverage = previousPeriod.length
    ? Math.round(
        previousPeriod.reduce(
          (total, entry) => total + entry.recoveryScore,
          0
        ) / previousPeriod.length
      )
    : null;

  return {
    overview: {
      average,
      highest: scores.length ? Math.max(...scores) : null,
      lowest: scores.length ? Math.min(...scores) : null,
      checkins: currentPeriod.length,
      streak,
      previousPeriodDifference:
        average !== null && previousAverage !== null
          ? average - previousAverage
          : null,
    },
    trend: currentPeriod.map(entry => ({
      date: toLocalDateKey(entry.localDate),
      score: entry.recoveryScore,
      sleepQuality: entry.sleepQuality,
      energy: entry.energy,
      stress: entry.stress,
      soreness: entry.soreness,
    })),
  };
}
