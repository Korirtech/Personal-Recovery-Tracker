import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

describe("analytics feedback states", () => {
  it("keeps loading, retry, and background-refresh affordances in the page contract", async () => {
    const source = await readFile(new URL("./pages/Analytics.tsx", import.meta.url), "utf8");
    expect(source).toContain("Loading analytics");
    expect(source).toContain("Try again");
    expect(source).toContain("Retrying…");
    expect(source).toContain("Updating");
    expect(source).toContain("placeholderData");
  });
});
