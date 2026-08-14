ALTER TABLE `daily_checkins` ADD CONSTRAINT `daily_checkins_sleep_quality_range` CHECK (`daily_checkins`.`sleepQuality` between 1 and 5);--> statement-breakpoint
ALTER TABLE `daily_checkins` ADD CONSTRAINT `daily_checkins_energy_range` CHECK (`daily_checkins`.`energy` between 1 and 5);--> statement-breakpoint
ALTER TABLE `daily_checkins` ADD CONSTRAINT `daily_checkins_stress_range` CHECK (`daily_checkins`.`stress` between 1 and 5);--> statement-breakpoint
ALTER TABLE `daily_checkins` ADD CONSTRAINT `daily_checkins_soreness_range` CHECK (`daily_checkins`.`soreness` between 1 and 5);--> statement-breakpoint
ALTER TABLE `daily_checkins` ADD CONSTRAINT `daily_checkins_sleep_duration_range` CHECK (`daily_checkins`.`sleepDurationHours` is null or `daily_checkins`.`sleepDurationHours` between 0 and 24);--> statement-breakpoint
ALTER TABLE `daily_checkins` ADD CONSTRAINT `daily_checkins_recovery_score_range` CHECK (`daily_checkins`.`recoveryScore` between 0 and 100);