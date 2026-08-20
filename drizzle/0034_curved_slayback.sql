CREATE TABLE `family_help_guides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`category` enum('housework','device','health','other') NOT NULL,
	`title` varchar(160) NOT NULL,
	`steps` varchar(600) NOT NULL,
	`is_pinned` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_help_guides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_seasonal_photo_prompts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`month_key` varchar(7) NOT NULL,
	`theme` varchar(160) NOT NULL,
	`detail` varchar(240),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_seasonal_photo_prompts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_tomorrow_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`target_date` timestamp NOT NULL,
	`kind` enum('plan','care','fun') NOT NULL,
	`note` varchar(280) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_tomorrow_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_help_guides_group_pinned_idx` ON `family_help_guides` (`family_group_id`,`is_pinned`);--> statement-breakpoint
CREATE INDEX `family_seasonal_photo_prompts_group_month_idx` ON `family_seasonal_photo_prompts` (`family_group_id`,`month_key`);--> statement-breakpoint
CREATE INDEX `family_tomorrow_memos_group_target_idx` ON `family_tomorrow_memos` (`family_group_id`,`target_date`);