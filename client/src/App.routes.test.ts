import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

describe("RecoveryLog application route contract", () => {
  it("registers all protected product routes behind the shared application shell", async () => {
    const source = await readFile(
      new URL("./App.tsx", import.meta.url),
      "utf8"
    );
    for (const route of [
      "/dashboard",
      "/check-in",
      "/history",
      "/analytics",
      "/insights",
      "/profile",
    ]) {
      expect(source).toContain(`path="${route}"`);
    }
    expect(source).toContain("<ProtectedPage>");
    expect(source).toContain("<Suspense");
  });
});
