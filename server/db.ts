import { and, desc, eq, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  dailyCheckins,
  insights,
  InsertUser,
  notificationPreferences,
  profiles,
  subscriptions,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import type { Mood } from "../shared/recovery";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function ensureRecoveryAccount(
  userId: number,
  name?: string | null
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db
    .insert(profiles)
    .values({
      userId,
      displayName: name?.trim() || null,
      timezone: "UTC",
    })
    .onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

  await db
    .insert(notificationPreferences)
    .values({
      userId,
      enabled: false,
      localReminderTime: "08:00",
      timezone: "UTC",
    })
    .onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

  await db
    .insert(subscriptions)
    .values({
      userId,
      plan: "free",
      status: "active",
    })
    .onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
}

export async function getRecoveryProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const result = await db
    .select({
      displayName: profiles.displayName,
      timezone: profiles.timezone,
      reminderEnabled: notificationPreferences.enabled,
      localReminderTime: notificationPreferences.localReminderTime,
      plan: subscriptions.plan,
      subscriptionStatus: subscriptions.status,
    })
    .from(profiles)
    .leftJoin(
      notificationPreferences,
      eq(notificationPreferences.userId, profiles.userId)
    )
    .leftJoin(subscriptions, eq(subscriptions.userId, profiles.userId))
    .where(eq(profiles.userId, userId))
    .limit(1);

  return result[0] ?? null;
}

export async function getCheckinForLocalDate(userId: number, localDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const result = await db
    .select()
    .from(dailyCheckins)
    .where(
      and(
        eq(dailyCheckins.userId, userId),
        eq(dailyCheckins.localDate, localDate)
      )
    )
    .limit(1);

  return result[0] ?? null;
}

export async function getCheckinsInRange(
  userId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  return db
    .select()
    .from(dailyCheckins)
    .where(
      and(
        eq(dailyCheckins.userId, userId),
        gte(dailyCheckins.localDate, startDate),
        lte(dailyCheckins.localDate, endDate)
      )
    )
    .orderBy(desc(dailyCheckins.localDate));
}

export async function getCheckinHistory(userId: number, limit = 365) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  return db
    .select()
    .from(dailyCheckins)
    .where(eq(dailyCheckins.userId, userId))
    .orderBy(desc(dailyCheckins.localDate))
    .limit(limit);
}

export async function updateRecoveryProfile(
  userId: number,
  input: {
    displayName: string | null;
    timezone: string;
    reminderEnabled: boolean;
    localReminderTime: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db.transaction(async tx => {
    await tx
      .update(profiles)
      .set({
        displayName: input.displayName,
        timezone: input.timezone,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, userId));

    await tx
      .update(notificationPreferences)
      .set({
        enabled: input.reminderEnabled,
        timezone: input.timezone,
        localReminderTime: input.localReminderTime,
        updatedAt: new Date(),
      })
      .where(eq(notificationPreferences.userId, userId));
  });
}

export async function upsertTodayCheckin(
  userId: number,
  localDate: Date,
  input: {
    sleepQuality: number;
    energy: number;
    stress: number;
    soreness: number;
    mood: Mood;
    sleepDurationHours?: number;
    recoveryScore: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const sleepDurationHours =
    input.sleepDurationHours === undefined
      ? null
      : input.sleepDurationHours.toFixed(2);

  await db
    .insert(dailyCheckins)
    .values({
      userId,
      localDate,
      sleepQuality: input.sleepQuality,
      energy: input.energy,
      stress: input.stress,
      soreness: input.soreness,
      mood: input.mood,
      sleepDurationHours,
      recoveryScore: input.recoveryScore,
    })
    .onDuplicateKeyUpdate({
      set: {
        sleepQuality: input.sleepQuality,
        energy: input.energy,
        stress: input.stress,
        soreness: input.soreness,
        mood: input.mood,
        sleepDurationHours,
        recoveryScore: input.recoveryScore,
        updatedAt: new Date(),
      },
    });
}

export async function updateCheckinById(
  userId: number,
  checkinId: number,
  input: {
    sleepQuality: number;
    energy: number;
    stress: number;
    soreness: number;
    mood: Mood;
    sleepDurationHours?: number;
    recoveryScore: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const sleepDurationHours =
    input.sleepDurationHours === undefined
      ? null
      : input.sleepDurationHours.toFixed(2);
  const result = await db
    .update(dailyCheckins)
    .set({
      sleepQuality: input.sleepQuality,
      energy: input.energy,
      stress: input.stress,
      soreness: input.soreness,
      mood: input.mood,
      sleepDurationHours,
      recoveryScore: input.recoveryScore,
      updatedAt: new Date(),
    })
    .where(
      and(eq(dailyCheckins.id, checkinId), eq(dailyCheckins.userId, userId))
    );

  return result[0]?.affectedRows ?? 0;
}

export async function deleteCheckinById(userId: number, checkinId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const result = await db
    .delete(dailyCheckins)
    .where(
      and(eq(dailyCheckins.id, checkinId), eq(dailyCheckins.userId, userId))
    );
  return result[0]?.affectedRows ?? 0;
}

export async function getInsightByFingerprint(
  userId: number,
  dataFingerprint: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const result = await db
    .select()
    .from(insights)
    .where(
      and(
        eq(insights.userId, userId),
        eq(insights.dataFingerprint, dataFingerprint)
      )
    )
    .limit(1);
  return result[0] ?? null;
}

export async function getLatestInsight(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const result = await db
    .select()
    .from(insights)
    .where(eq(insights.userId, userId))
    .orderBy(desc(insights.updatedAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getReminderPreferenceByTaskUid(
  scheduleCronTaskUid: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const result = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.scheduleCronTaskUid, scheduleCronTaskUid))
    .limit(1);
  return result[0] ?? null;
}

export async function deleteRecoveryAccount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const result = await db.delete(users).where(eq(users.id, userId));
  return result[0]?.affectedRows ?? 0;
}

export async function upsertInsight(
  userId: number,
  input: {
    periodStart: Date;
    periodEnd: Date;
    dataFingerprint: string;
    title: string;
    observation: string;
    evidence: string;
    confidence: "low" | "moderate" | "high";
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db
    .insert(insights)
    .values({ userId, ...input })
    .onDuplicateKeyUpdate({
      set: {
        title: input.title,
        observation: input.observation,
        evidence: input.evidence,
        confidence: input.confidence,
        updatedAt: new Date(),
      },
    });

  return getInsightByFingerprint(userId, input.dataFingerprint);
}
