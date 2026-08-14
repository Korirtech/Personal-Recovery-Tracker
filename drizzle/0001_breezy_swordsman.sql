CREATE TABLE `daily_checkins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`localDate` date NOT NULL,
	`sleepQuality` int NOT NULL,
	`energy` int NOT NULL,
	`stress` int NOT NULL,
	`soreness` int NOT NULL,
	`mood` enum('good','okay','low') NOT NULL,
	`sleepDurationHours` decimal(4,2),
	`recoveryScore` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
		CONSTRAINT `daily_checkins_id` PRIMARY KEY(`id`),
		CONSTRAINT `daily_checkins_user_date_unique` UNIQUE(`userId`,`localDate`)
);
--> statement-breakpoint
CREATE TABLE `insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`periodStart` date NOT NULL,
	`periodEnd` date NOT NULL,
	`dataFingerprint` varchar(128) NOT NULL,
	`title` varchar(180) NOT NULL,
	`observation` text NOT NULL,
	`evidence` text NOT NULL,
	`confidence` enum('low','moderate','high') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `insights_id` PRIMARY KEY(`id`),
	CONSTRAINT `insights_user_fingerprint_unique` UNIQUE(`userId`,`dataFingerprint`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`userId` int NOT NULL,
	`enabled` boolean NOT NULL DEFAULT false,
	`localReminderTime` varchar(5) NOT NULL DEFAULT '08:00',
	`timezone` varchar(64) NOT NULL DEFAULT 'UTC',
	`scheduleCronTaskUid` varchar(65),
	`lastReminderLocalDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_userId` PRIMARY KEY(`userId`),
	CONSTRAINT `notification_preferences_scheduleCronTaskUid_unique` UNIQUE(`scheduleCronTaskUid`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`userId` int NOT NULL,
	`displayName` varchar(120),
	`timezone` varchar(64) NOT NULL DEFAULT 'UTC',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`userId` int NOT NULL,
	`plan` enum('free','pro') NOT NULL DEFAULT 'free',
	`status` enum('active','canceled','past_due','expired') NOT NULL DEFAULT 'active',
	`provider` varchar(32),
	`providerCustomerId` varchar(191),
	`currentPeriodEnd` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
ALTER TABLE `daily_checkins` ADD CONSTRAINT `daily_checkins_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `insights` ADD CONSTRAINT `insights_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `daily_checkins_user_date_idx` ON `daily_checkins` (`userId`,`localDate`);--> statement-breakpoint
CREATE INDEX `insights_user_period_idx` ON `insights` (`userId`,`periodEnd`);--> statement-breakpoint
CREATE INDEX `notification_preferences_schedule_idx` ON `notification_preferences` (`scheduleCronTaskUid`);--> statement-breakpoint
CREATE INDEX `subscriptions_plan_status_idx` ON `subscriptions` (`plan`,`status`);
