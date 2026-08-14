import { expect, test, type Page, type Route } from "@playwright/test";

type Plan = "free" | "pro";

type FixtureOptions = {
  plan: Plan;
  exportFailure?: "csv" | "pdf";
};

function trpcResponse(data: unknown) {
  return { result: { data: { json: data } } };
}

async function fulfill(route: Route, data: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(trpcResponse(data)),
  });
}

async function installNetworkFixtures(page: Page, options: FixtureOptions) {
  let saved = false;
  const checkin = {
    id: 1,
    userId: 101,
    localDate: new Date("2026-08-14T00:00:00.000Z"),
    sleepQuality: 4,
    energy: 4,
    stress: 2,
    soreness: 2,
    mood: "good",
    sleepDurationHours: 7.5,
    recoveryScore: 81,
  };

  await page.route("**/api/trpc/**", async route => {
    const procedure =
      new URL(route.request().url()).pathname.split("/api/trpc/")[1] ?? "";
    if (procedure.includes(",")) {
      const responses = procedure.split(",").map(name => {
        if (name === "auth.me")
          return trpcResponse({
            id: 101,
            openId: "e2e-user",
            name: "E2E User",
            email: "e2e@example.com",
            role: "user",
          });
        if (name === "recovery.profile.get")
          return trpcResponse({
            email: "e2e@example.com",
            accountName: "E2E User",
            profile: {
              displayName: "E2E User",
              timezone: "UTC",
              reminderEnabled: false,
              localReminderTime: "08:00",
              plan: options.plan,
              subscriptionStatus: "active",
            },
          });
        if (name === "recovery.checkins.getToday")
          return trpcResponse({
            checkin: saved ? checkin : null,
            localDate: "2026-08-14",
            timezone: "UTC",
          });
        if (name === "recovery.analytics.get")
          return trpcResponse({
            plan: options.plan,
            localDate: "2026-08-14",
            overview: {
              average: 78,
              highest: 81,
              lowest: 75,
              checkins: 2,
              streak: 2,
              previousPeriodDifference: null,
            },
            trend: [
              { date: "2026-08-13", score: 75 },
              { date: "2026-08-14", score: 81 },
            ],
          });
        return trpcResponse({});
      });
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(responses),
      });
    }
    if (procedure.endsWith("auth.me")) {
      return fulfill(route, {
        id: 101,
        openId: "e2e-user",
        name: "E2E User",
        email: "e2e@example.com",
        role: "user",
      });
    }
    if (procedure.endsWith("recovery.profile.get")) {
      return fulfill(route, {
        email: "e2e@example.com",
        accountName: "E2E User",
        profile: {
          displayName: "E2E User",
          timezone: "UTC",
          reminderEnabled: false,
          localReminderTime: "08:00",
          plan: options.plan,
          subscriptionStatus: "active",
        },
      });
    }
    if (procedure.endsWith("recovery.checkins.getToday")) {
      return fulfill(route, {
        checkin: saved ? checkin : null,
        localDate: "2026-08-14",
        timezone: "UTC",
      });
    }
    if (procedure.endsWith("recovery.checkins.saveToday")) {
      saved = true;
      return fulfill(route, {
        checkin,
        score: {
          score: 81,
          category: "excellent",
          components: {
            sleep: 75,
            energy: 75,
            stress: 75,
            soreness: 75,
            mood: 100,
          },
        },
        localDate: "2026-08-14",
        status: "created",
      });
    }
    if (procedure.endsWith("recovery.analytics.get")) {
      return fulfill(route, {
        plan: options.plan,
        localDate: "2026-08-14",
        overview: {
          average: 78,
          highest: 81,
          lowest: 75,
          checkins: 2,
          streak: 2,
          previousPeriodDifference: null,
        },
        trend: [
          { date: "2026-08-13", score: 75 },
          { date: "2026-08-14", score: 81 },
        ],
      });
    }
    if (procedure.endsWith("recovery.exports.chartCsv")) {
      if (options.exportFailure === "csv") {
        return route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: { message: "Export unavailable" } }),
        });
      }
      return fulfill(route, {
        fileName: "recoverylog-chart-2026-08-14.csv",
        mimeType: "text/csv;charset=utf-8",
        base64: btoa("Date,Recovery score\n2026-08-13,75\n2026-08-14,81"),
      });
    }
    if (procedure.endsWith("recovery.exports.chartPdf")) {
      if (options.exportFailure === "pdf") {
        return route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: { message: "Export unavailable" } }),
        });
      }
      return fulfill(route, {
        fileName: "recoverylog-chart-2026-08-14.pdf",
        mimeType: "application/pdf",
        base64: btoa("%PDF-1.7\nRecoveryLog E2E export"),
      });
    }
    return route.continue();
  });
}

test.describe("RecoveryLog authenticated user flows", () => {
  test("completes the check-in wizard and exposes duplicate-day editing", async ({
    page,
  }) => {
    await installNetworkFixtures(page, { plan: "pro" });
    await page.goto("/check-in");
    await expect(
      page.getByRole("heading", { name: "How did you sleep?" })
    ).toBeVisible();
    await expect(page.getByText("Step 1 of 6")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();

    for (let step = 0; step < 4; step += 1) {
      await page.getByRole("radio").nth(3).click();
      await expect(
        page.getByRole("button", { name: "Continue" })
      ).toBeEnabled();
      await page.getByRole("button", { name: "Continue" }).click();
      await expect(page.getByText(`Step ${step + 2} of 6`)).toBeVisible();
    }
    await page.getByRole("radio", { name: "Good" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Save check-in" }).click();
    await expect(
      page.getByRole("heading", { name: "A clearer picture of today." })
    ).toBeVisible();
    await expect(page.getByText("81")).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("heading", {
        name: "You’ve already completed today’s check-in.",
      })
    ).toBeVisible();
    await page.getByRole("button", { name: "Edit today’s check-in" }).click();
    await expect(page.getByText("Editing saved entry")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "How did you sleep?" })
    ).toBeVisible();
  });

  test("shows a user-facing error when an export provider fails", async ({
    page,
  }) => {
    await installNetworkFixtures(page, { plan: "pro", exportFailure: "csv" });
    await page.goto("/analytics");
    await expect(
      page.getByRole("heading", { name: "30-day overview" })
    ).toBeVisible();
    await page.getByRole("button", { name: "CSV" }).click();
    await expect(page.getByRole("alert")).toContainText(
      "We couldn’t prepare that export"
    );
  });

  test("downloads CSV and PDF chart exports for Pro and locks them for Free", async ({
    page,
  }) => {
    await installNetworkFixtures(page, { plan: "pro" });
    await page.goto("/analytics");
    await expect(
      page.getByRole("heading", { name: "30-day overview" })
    ).toBeVisible();

    const csvDownloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "CSV" }).click();
    const csvDownload = await csvDownloadPromise;
    expect(csvDownload.suggestedFilename()).toBe(
      "recoverylog-chart-2026-08-14.csv"
    );
    expect(await csvDownload.path()).not.toBeNull();

    const pdfDownloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "PDF" }).click();
    const pdfDownload = await pdfDownloadPromise;
    expect(pdfDownload.suggestedFilename()).toBe(
      "recoverylog-chart-2026-08-14.pdf"
    );
    expect(await pdfDownload.path()).not.toBeNull();

    await page.unrouteAll();
    await installNetworkFixtures(page, { plan: "free" });
    await page.reload();
    await expect(page.getByText("Pro export: CSV and PDF")).toBeVisible();
    await expect(page.getByRole("button", { name: "CSV" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "PDF" })).toHaveCount(0);
  });
});
