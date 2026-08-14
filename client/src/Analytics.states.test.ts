import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

describe("analytics feedback states", () => {
  it("keeps loading, retry, and background-refresh affordances in the page contract", async () => {
    const source = await readFile(
      new URL("./pages/Analytics.tsx", import.meta.url),
      "utf8"
    );
    expect(source).toContain("Loading analytics");
    expect(source).toContain("Try again");
    expect(source).toContain("Retrying…");
    expect(source).toContain("Updating");
    expect(source).toContain("placeholderData");
    expect(source).toContain("Pro export: CSV and PDF");
    expect(source).toContain("chartCsv");
    expect(source).toContain("chartPdf");
    expect(source).toContain("Preparing…");
    expect(source).toContain("useTheme");
    expect(source).toContain('aria-pressed={theme === "dark"}');
    expect(source).toContain("Switch to dark mode");
    expect(source).toContain("dark:bg-slate-900");
    expect(source).toContain('theme === "dark" ? "#334155"');
  });
});
