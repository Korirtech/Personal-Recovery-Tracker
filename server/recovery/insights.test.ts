import { describe, expect, it } from "vitest";
import { validateInsightPayload } from "./insights";

describe("validateInsightPayload", () => {
  it("accepts a concise, evidence-grounded, cautious pattern observation", () => {
    expect(
      validateInsightPayload({
        title: "Sleep and energy pattern",
        observation:
          "Your logged data suggests that energy tends to be lower after shorter nights.",
        evidence:
          "Across the entries in this summary, shorter sleep coincided with lower energy ratings more often.",
        confidence: "moderate",
      }).confidence
    ).toBe("moderate");
  });

  it("rejects unsafe medical or causal language before it can be stored", () => {
    expect(() =>
      validateInsightPayload({
        title: "Medical diagnosis result",
        observation: "This proves you have an illness caused by stress.",
        evidence: "The records prove a disease pattern.",
        confidence: "high",
      })
    ).toThrow();
  });
});
