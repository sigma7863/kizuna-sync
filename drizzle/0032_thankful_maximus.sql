CREATE TABLE `family_gentle_reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`note` varchar(240),
	`due_at` timestamp,
	`is_completed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_gentle_reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_weekend_reflections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`week_key` varchar(10) NOT NULL,
	`good_thing` varchar(280) NOT NULL,
	`next_hope` varchar(280),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_weekend_reflections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_gentle_reminders_group_completed_idx` ON `family_gentle_reminders` (`family_group_id`,`is_completed`);--> statement-breakpoint
CREATE INDEX `family_weekend_reflections_group_week_idx` ON `family_weekend_reflections` (`family_group_id`,`week_key`);