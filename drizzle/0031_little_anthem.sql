CREATE TABLE `family_daily_question_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`question_id` int NOT NULL,
	`user_id` int NOT NULL,
	`answer` varchar(280) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_daily_question_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_daily_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`day_key` varchar(10) NOT NULL,
	`question` varchar(280) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_daily_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_encouragement_stamps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`stamp` enum('sun','heart','clap','rainbow') NOT NULL,
	`message` varchar(180),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_encouragement_stamps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_home_preparation_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`note` varchar(240),
	`is_completed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_home_preparation_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_daily_question_answers_question_idx` ON `family_daily_question_answers` (`family_group_id`,`question_id`);--> statement-breakpoint
CREATE INDEX `family_daily_questions_group_day_idx` ON `family_daily_questions` (`family_group_id`,`day_key`);--> statement-breakpoint
CREATE INDEX `family_encouragement_stamps_group_created_idx` ON `family_encouragement_stamps` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_home_preparation_group_completed_idx` ON `family_home_preparation_items` (`family_group_id`,`is_completed`);