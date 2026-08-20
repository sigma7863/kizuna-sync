CREATE TABLE `family_bedtime_preparation_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`kind` enum('bag','clothes','plan','care') NOT NULL,
	`memo` varchar(180) NOT NULL,
	`is_prepared` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_bedtime_preparation_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_tiny_achievement_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`kind` enum('kindness','effort','bravery','care') NOT NULL,
	`title` varchar(160) NOT NULL,
	`is_celebrated` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_tiny_achievement_badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_weekly_cheer_themes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`week_key` varchar(10) NOT NULL,
	`theme` varchar(120) NOT NULL,
	`support` varchar(180),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_weekly_cheer_themes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_bedtime_prep_group_prepared_idx` ON `family_bedtime_preparation_memos` (`family_group_id`,`is_prepared`);--> statement-breakpoint
CREATE INDEX `family_tiny_badges_group_celebrated_idx` ON `family_tiny_achievement_badges` (`family_group_id`,`is_celebrated`);--> statement-breakpoint
CREATE INDEX `family_weekly_cheer_group_week_idx` ON `family_weekly_cheer_themes` (`family_group_id`,`week_key`);