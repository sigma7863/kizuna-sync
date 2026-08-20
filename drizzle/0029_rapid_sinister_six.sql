CREATE TABLE `family_monthly_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`month_key` varchar(7) NOT NULL,
	`title` varchar(160) NOT NULL,
	`encouragement` varchar(240),
	`is_completed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_monthly_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_photo_captions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`photo_id` int NOT NULL,
	`caption` varchar(280) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_photo_captions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_quiet_time_signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`state` enum('focus','rest','sleeping') NOT NULL,
	`note` varchar(180),
	`until_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_quiet_time_signals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_monthly_goals_group_month_idx` ON `family_monthly_goals` (`family_group_id`,`month_key`);--> statement-breakpoint
CREATE INDEX `family_photo_captions_group_photo_idx` ON `family_photo_captions` (`family_group_id`,`photo_id`);--> statement-breakpoint
CREATE INDEX `family_quiet_time_signals_group_created_idx` ON `family_quiet_time_signals` (`family_group_id`,`created_at`);