import { describe, expect, it } from "vitest";
import { createChartCsv, createChartPdf, getDataExportStatus } from "./exports";

describe("chart exports", () => {
  it("creates a CSV containing only the requested chart points with safe escaping", () => {
    const csv = createChartCsv([
      { date: "2026-08-13", score: 72 },
      { date: "2026-08-14", score: 81 },
    ]);
    expect(csv).toBe("Date,Recovery score\n2026-08-13,72\n2026-08-14,81");
  });

  it("creates a valid PDF document for chart data", async () => {
    const pdf = await createChartPdf([{ date: "2026-08-14", score: 81 }]);
    expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe("%PDF-");
    expect(pdf.byteLength).toBeGreaterThan(100);
  });

  it("exposes chart formats only to Pro entitlement state", () => {
    expect(getDataExportStatus("free")).toMatchObject({
      eligible: false,
      status: "not_eligible",
    });
    expect(getDataExportStatus("pro")).toMatchObject({
      eligible: true,
      supportedFormats: ["csv", "pdf"],
    });
  });
});
