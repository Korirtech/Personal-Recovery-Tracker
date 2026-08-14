import {
  getRecoveryCategory,
  type RecoveryInputs,
  type RecoveryScoreResult,
} from "../../shared/recovery";

const SCALE_MIN = 1;
const SCALE_MAX = 5;

const MOOD_SCORES = {
  good: 100,
  okay: 60,
  low: 20,
} as const;

function normalizePositiveScore(value: number) {
  return ((value - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
}

function normalizeReverseScore(value: number) {
  return ((SCALE_MAX - value) / (SCALE_MAX - SCALE_MIN)) * 100;
}

export function calculateRecoveryScore(
  input: RecoveryInputs
): RecoveryScoreResult {
  const components = {
    sleep: normalizePositiveScore(input.sleepQuality),
    energy: normalizePositiveScore(input.energy),
    stress: normalizeReverseScore(input.stress),
    soreness: normalizeReverseScore(input.soreness),
    mood: MOOD_SCORES[input.mood],
  };

  const weightedScore =
    components.sleep * 0.3 +
    components.energy * 0.25 +
    components.stress * 0.2 +
    components.soreness * 0.15 +
    components.mood * 0.1;

  const score = Math.min(100, Math.max(0, Math.round(weightedScore)));

  return {
    score,
    category: getRecoveryCategory(score),
    components,
  };
}
