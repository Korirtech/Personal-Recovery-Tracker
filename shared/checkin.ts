import { z } from "zod";
import { MOOD_VALUES } from "./recovery";

export const checkinInputSchema = z.object({
  sleepQuality: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  stress: z.number().int().min(1).max(5),
  soreness: z.number().int().min(1).max(5),
  mood: z.enum(MOOD_VALUES),
  sleepDurationHours: z.number().min(0).max(24).optional(),
});

export type CheckinInput = z.infer<typeof checkinInputSchema>;
