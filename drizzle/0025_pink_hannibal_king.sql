CREATE TABLE `family_achievement_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`category` enum('help','movement','challenge','other') NOT NULL DEFAULT 'other',
	`note` varchar(240),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_achievement_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_morning_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`departure_time` varchar(5),
	`mood_sign` varchar(32),
	`carrying_items` varchar(280),
	`is_ready` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_morning_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_voice_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`file_key` varchar(512) NOT NULL,
	`audio_url` varchar(512) NOT NULL,
	`mime_type` varchar(64) NOT NULL,
	`duration_seconds` int NOT NULL,
	`note` varchar(180),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_voice_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_achievement_entries_group_created_idx` ON `family_achievement_entries` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_morning_plans_group_created_idx` ON `family_morning_plans` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_voice_memos_group_created_idx` ON `family_voice_memos` (`family_group_id`,`created_at`);