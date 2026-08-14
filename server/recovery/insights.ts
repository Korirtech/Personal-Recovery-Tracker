import { createHash } from "node:crypto";
import { z } from "zod";
import type { DailyCheckin } from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";

const insightSchema = z
  .object({
    title: z.string().trim().min(8).max(110),
    observation: z.string().trim().min(24).max(500),
    evidence: z.string().trim().min(16).max(500),
    confidence: z.enum(["low", "moderate", "high"]),
  })
  .strict();

export type ValidatedInsight = z.infer<typeof insightSchema>;

function average(values: number[]) {
  if (!values.length) return null;
  return (
    Math.round(
      (values.reduce((total, value) => total + value, 0) / values.length) * 10
    ) / 10
  );
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function buildPatternSummary(entries: DailyCheckin[]) {
  const chronological = [...entries].sort(
    (left, right) => left.localDate.getTime() - right.localDate.getTime()
  );
  const shortSleep = chronological.filter(
    entry =>
      entry.sleepDurationHours !== null && Number(entry.sleepDurationHours) < 6
  );
  const longerSleep = chronological.filter(
    entry =>
      entry.sleepDurationHours !== null && Number(entry.sleepDurationHours) >= 7
  );
  const highStress = chronological.filter(entry => entry.stress >= 4);
  const lowStress = chronological.filter(entry => entry.stress <= 2);
  const highSoreness = chronological.filter(entry => entry.soreness >= 4);
  const lowSoreness = chronological.filter(entry => entry.soreness <= 2);
  const midpoint = Math.ceil(chronological.length / 2);
  const firstHalf = chronological.slice(0, midpoint);
  const secondHalf = chronological.slice(midpoint);

  const summary = {
    checkinCount: chronological.length,
    dateRange: chronological.length
      ? {
          start: dateKey(chronological[0].localDate),
          end: dateKey(chronological.at(-1)!.localDate),
        }
      : null,
    recovery: {
      average: average(chronological.map(entry => entry.recoveryScore)),
      firstHalfAverage: average(firstHalf.map(entry => entry.recoveryScore)),
      secondHalfAverage: average(secondHalf.map(entry => entry.recoveryScore)),
    },
    sleepAndEnergy: {
      shortSleepDays: shortSleep.length,
      shortSleepLowEnergyDays: shortSleep.filter(entry => entry.energy <= 2)
        .length,
      shortSleepAverageRecovery: average(
        shortSleep.map(entry => entry.recoveryScore)
      ),
      longerSleepDays: longerSleep.length,
      longerSleepAverageRecovery: average(
        longerSleep.map(entry => entry.recoveryScore)
      ),
    },
    stressAndRecovery: {
      highStressDays: highStress.length,
      highStressAverageRecovery: average(
        highStress.map(entry => entry.recoveryScore)
      ),
      lowStressDays: lowStress.length,
      lowStressAverageRecovery: average(
        lowStress.map(entry => entry.recoveryScore)
      ),
    },
    sorenessAndRecovery: {
      highSorenessDays: highSoreness.length,
      highSorenessAverageRecovery: average(
        highSoreness.map(entry => entry.recoveryScore)
      ),
      lowSorenessDays: lowSoreness.length,
      lowSorenessAverageRecovery: average(
        lowSoreness.map(entry => entry.recoveryScore)
      ),
    },
    consistency: {
      loggedDates: chronological.map(entry => dateKey(entry.localDate)),
    },
  };

  return summary;
}

export function fingerprintPatternSummary(
  summary: ReturnType<typeof buildPatternSummary>
) {
  return createHash("sha256").update(JSON.stringify(summary)).digest("hex");
}

function assertSafeInsight(insight: ValidatedInsight) {
  const combined =
    `${insight.title} ${insight.observation} ${insight.evidence}`.toLowerCase();
  const disallowed = [
    "diagnos",
    "disease",
    "illness",
    "medication",
    "treatment",
    "disorder",
    "injury",
    "prescription",
    "cause",
    "proves",
  ];
  if (disallowed.some(term => combined.includes(term))) {
    throw new Error("Generated content did not satisfy wellness safety rules");
  }
  if (!/(logged|entries|pattern|appears|may|tends|suggest)/.test(combined)) {
    throw new Error(
      "Generated content did not use appropriately cautious pattern language"
    );
  }
}

export function validateInsightPayload(value: unknown) {
  const insight = insightSchema.parse(value);
  assertSafeInsight(insight);
  return insight;
}

async function generateOnce(summary: ReturnType<typeof buildPatternSummary>) {
  const response = await invokeLLM({
    model: "gpt-5-mini",
    max_tokens: 500,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "recoverylog_wellness_insight",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            observation: { type: "string" },
            evidence: { type: "string" },
            confidence: { type: "string", enum: ["low", "moderate", "high"] },
          },
          required: ["title", "observation", "evidence", "confidence"],
        },
      },
    },
    messages: [
      {
        role: "system",
        content:
          "You write a single concise wellness pattern insight from a private, de-identified statistical summary. This is not medical advice. Do not diagnose, mention diseases, medication, treatment, injuries, disorders, causation, certainty, or exercise intensity. Use only cautious correlation language such as 'Your logged data suggests', 'There appears to be a pattern', 'may', or 'tends to'. Ground the observation and evidence in the supplied numerical summary. Do not invent facts. Return JSON only.",
      },
      {
        role: "user",
        content: `Create one helpful, non-medical pattern observation from this summary. Prefer a pattern with enough supporting entries; if evidence is weak, say so clearly. Summary:\n${JSON.stringify(summary)}`,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  if (typeof content !== "string")
    throw new Error("Insight response was not text");
  return validateInsightPayload(JSON.parse(content));
}

export async function generateValidatedInsight(
  summary: ReturnType<typeof buildPatternSummary>
) {
  try {
    return await generateOnce(summary);
  } catch (firstError) {
    try {
      return await generateOnce(summary);
    } catch {
      throw firstError;
    }
  }
}
