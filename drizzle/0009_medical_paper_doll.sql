CREATE TABLE `family_poll_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`poll_id` int NOT NULL,
	`respondent_user_id` int NOT NULL,
	`option_index` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_poll_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_polls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`creator_user_id` int NOT NULL,
	`question` varchar(240) NOT NULL,
	`options` json NOT NULL,
	`ends_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_polls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_shopping_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`purchased_by_user_id` int,
	`item_name` varchar(160) NOT NULL,
	`quantity` varchar(80),
	`is_purchased` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_shopping_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_time_capsules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`creator_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`message` text NOT NULL,
	`opens_at` timestamp NOT NULL,
	`opened_at` timestamp,
	`schedule_cron_task_uid` varchar(65),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_time_capsules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_poll_responses_poll_user_idx` ON `family_poll_responses` (`poll_id`,`respondent_user_id`);--> statement-breakpoint
CREATE INDEX `family_polls_group_ends_idx` ON `family_polls` (`family_group_id`,`ends_at`);--> statement-breakpoint
CREATE INDEX `family_shopping_items_group_purchased_idx` ON `family_shopping_items` (`family_group_id`,`is_purchased`);--> statement-breakpoint
CREATE INDEX `family_time_capsules_group_opens_idx` ON `family_time_capsules` (`family_group_id`,`opens_at`);--> statement-breakpoint
CREATE INDEX `family_time_capsules_task_uid_idx` ON `family_time_capsules` (`schedule_cron_task_uid`);