import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

describe("RecoveryLog protected procedures", () => {
  it("rejects a request without an authenticated account before data access", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });

    await expect(caller.recovery.dashboard.get()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    await expect(caller.recovery.exports.chartCsv()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    await expect(caller.recovery.exports.chartPdf()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
