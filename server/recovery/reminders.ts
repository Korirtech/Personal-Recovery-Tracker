import type { Request, Response } from "express";
import { sdk } from "../_core/sdk";
import { getCheckinForLocalDate, getReminderPreferenceByTaskUid } from "../db";
import { getLocalDateKey, localDateToDatabaseDate } from "./timezone";

/**
 * The callback establishes delivery and idempotency boundaries. A channel adapter
 * (email, push, or a verified webhook) must be configured before reminders can be sent.
 * This MVP deliberately does not masquerade a database preference as a delivered notice.
 */
export async function handleRecoveryReminder(req: Request, res: Response) {
  try {
    const caller = await sdk.authenticateRequest(req);
    if (!caller.isCron || !caller.taskUid)
      return res.status(403).json({ error: "cron-only" });

    const preference = await getReminderPreferenceByTaskUid(caller.taskUid);
    if (!preference)
      return res.json({ ok: true, skipped: "orphaned_schedule" });
    if (!preference.enabled) return res.json({ ok: true, skipped: "disabled" });

    const localDate = getLocalDateKey(preference.timezone);
    if (
      preference.lastReminderLocalDate?.toISOString().slice(0, 10) === localDate
    ) {
      return res.json({ ok: true, skipped: "already_processed_today" });
    }

    const checkin = await getCheckinForLocalDate(
      preference.userId,
      localDateToDatabaseDate(localDate)
    );
    if (checkin)
      return res.json({ ok: true, skipped: "checkin_already_complete" });

    return res.json({
      ok: true,
      skipped: "delivery_channel_not_configured",
      message:
        "No end-user email, push, or verified webhook provider has been configured for this project.",
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Unknown scheduled reminder error",
      timestamp: new Date().toISOString(),
    });
  }
}
