CREATE TABLE `family_weekend_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` text,
	`activity_type` enum('indoor','outdoor','hybrid') NOT NULL,
	`shared_poll_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_weekend_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_weekend_plans_group_created_idx` ON `family_weekend_plans` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_weekend_plans_group_shared_idx` ON `family_weekend_plans` (`family_group_id`,`shared_poll_id`);