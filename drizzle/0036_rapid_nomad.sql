CREATE TABLE `family_morning_encouragements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`message` varchar(180) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_morning_encouragements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_question_box_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`question` varchar(280) NOT NULL,
	`is_anonymous` boolean NOT NULL DEFAULT false,
	`is_opened` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_question_box_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_weekend_homecoming_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`planned_at` timestamp NOT NULL,
	`meeting_place` varchar(160),
	`note` varchar(240),
	`is_confirmed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_weekend_homecoming_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_morning_encouragements_group_created_idx` ON `family_morning_encouragements` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_question_box_entries_group_opened_idx` ON `family_question_box_entries` (`family_group_id`,`is_opened`);--> statement-breakpoint
CREATE INDEX `family_weekend_homecoming_plans_group_planned_idx` ON `family_weekend_homecoming_plans` (`family_group_id`,`planned_at`);