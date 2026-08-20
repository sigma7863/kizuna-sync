CREATE TABLE `family_monthly_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` varchar(240),
	`target_count` int NOT NULL,
	`progress_count` int NOT NULL DEFAULT 0,
	`celebration_note` varchar(180),
	`is_completed` boolean NOT NULL DEFAULT false,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_monthly_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_monthly_challenges_group_done_idx` ON `family_monthly_challenges` (`family_group_id`,`is_completed`);