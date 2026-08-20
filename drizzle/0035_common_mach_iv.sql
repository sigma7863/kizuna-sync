CREATE TABLE `family_memory_bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`source_type` enum('photo','post','other') NOT NULL,
	`source_label` varchar(160) NOT NULL,
	`reason` varchar(280) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_memory_bookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_talk_timings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`state` enum('available','later','quiet') NOT NULL,
	`note` varchar(160),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_talk_timings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_weekly_promises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`week_key` varchar(10) NOT NULL,
	`title` varchar(160) NOT NULL,
	`note` varchar(240),
	`is_completed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_weekly_promises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_memory_bookmarks_group_created_idx` ON `family_memory_bookmarks` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_talk_timings_group_created_idx` ON `family_talk_timings` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_weekly_promises_group_week_idx` ON `family_weekly_promises` (`family_group_id`,`week_key`);