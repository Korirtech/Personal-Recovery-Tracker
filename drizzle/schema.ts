import {
  boolean,
  check,
  date,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const profiles = mysqlTable("profiles", {
  userId: int("userId")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: varchar("displayName", { length: 120 }),
  timezone: varchar("timezone", { length: 64 }).notNull().default("UTC"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const dailyCheckins = mysqlTable(
  "daily_checkins",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    localDate: date("localDate").notNull(),
    sleepQuality: int("sleepQuality").notNull(),
    energy: int("energy").notNull(),
    stress: int("stress").notNull(),
    soreness: int("soreness").notNull(),
    mood: mysqlEnum("mood", ["good", "okay", "low"]).notNull(),
    sleepDurationHours: decimal("sleepDurationHours", {
      precision: 4,
      scale: 2,
    }),
    recoveryScore: int("recoveryScore").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("daily_checkins_user_date_unique").on(
      table.userId,
      table.localDate
    ),
    index("daily_checkins_user_date_idx").on(table.userId, table.localDate),
    check(
      "daily_checkins_sleep_quality_range",
      sql`${table.sleepQuality} between 1 and 5`
    ),
    check("daily_checkins_energy_range", sql`${table.energy} between 1 and 5`),
    check("daily_checkins_stress_range", sql`${table.stress} between 1 and 5`),
    check(
      "daily_checkins_soreness_range",
      sql`${table.soreness} between 1 and 5`
    ),
    check(
      "daily_checkins_sleep_duration_range",
      sql`${table.sleepDurationHours} is null or ${table.sleepDurationHours} between 0 and 24`
    ),
    check(
      "daily_checkins_recovery_score_range",
      sql`${table.recoveryScore} between 0 and 100`
    ),
  ]
);

export const insights = mysqlTable(
  "insights",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    periodStart: date("periodStart").notNull(),
    periodEnd: date("periodEnd").notNull(),
    dataFingerprint: varchar("dataFingerprint", { length: 128 }).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    observation: text("observation").notNull(),
    evidence: text("evidence").notNull(),
    confidence: mysqlEnum("confidence", ["low", "moderate", "high"]).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("insights_user_fingerprint_unique").on(
      table.userId,
      table.dataFingerprint
    ),
    index("insights_user_period_idx").on(table.userId, table.periodEnd),
  ]
);

export const notificationPreferences = mysqlTable(
  "notification_preferences",
  {
    userId: int("userId")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    enabled: boolean("enabled").notNull().default(false),
    localReminderTime: varchar("localReminderTime", { length: 5 })
      .notNull()
      .default("08:00"),
    timezone: varchar("timezone", { length: 64 }).notNull().default("UTC"),
    scheduleCronTaskUid: varchar("scheduleCronTaskUid", {
      length: 65,
    }).unique(),
    lastReminderLocalDate: date("lastReminderLocalDate"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("notification_preferences_schedule_idx").on(
      table.scheduleCronTaskUid
    ),
  ]
);

export const subscriptions = mysqlTable(
  "subscriptions",
  {
    userId: int("userId")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    plan: mysqlEnum("plan", ["free", "pro"]).notNull().default("free"),
    status: mysqlEnum("status", ["active", "canceled", "past_due", "expired"])
      .notNull()
      .default("active"),
    provider: varchar("provider", { length: 32 }),
    providerCustomerId: varchar("providerCustomerId", { length: 191 }),
    currentPeriodEnd: timestamp("currentPeriodEnd"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("subscriptions_plan_status_idx").on(table.plan, table.status)]
);

export type Profile = typeof profiles.$inferSelect;
export type DailyCheckin = typeof dailyCheckins.$inferSelect;
export type Insight = typeof insights.$inferSelect;
export type NotificationPreference =
  typeof notificationPreferences.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
