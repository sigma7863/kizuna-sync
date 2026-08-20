CREATE TABLE `family_celebration_dates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`celebration_at` timestamp NOT NULL,
	`schedule_cron_task_uid` varchar(65),
	`celebrated_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_celebration_dates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_safety_checklist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`label` varchar(180) NOT NULL,
	`category` varchar(80) NOT NULL,
	`is_completed` boolean NOT NULL DEFAULT false,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_safety_checklist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_celebration_dates_group_at_idx` ON `family_celebration_dates` (`family_group_id`,`celebration_at`);--> statement-breakpoint
CREATE INDEX `family_celebration_dates_task_uid_idx` ON `family_celebration_dates` (`schedule_cron_task_uid`);--> statement-breakpoint
CREATE INDEX `family_safety_checklist_group_done_idx` ON `family_safety_checklist_items` (`family_group_id`,`is_completed`);