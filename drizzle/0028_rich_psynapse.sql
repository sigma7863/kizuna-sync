CREATE TABLE `family_fun_countdowns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`event_at` timestamp NOT NULL,
	`note` varchar(240),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_fun_countdowns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_meal_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`dish_name` varchar(160) NOT NULL,
	`reason` varchar(240),
	`status` enum('open','planned','served') NOT NULL DEFAULT 'open',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_meal_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_memory_quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`question` varchar(300) NOT NULL,
	`option_a` varchar(180) NOT NULL,
	`option_b` varchar(180) NOT NULL,
	`option_c` varchar(180) NOT NULL,
	`correct_answer` enum('a','b','c') NOT NULL,
	`hint` varchar(240),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_memory_quizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_fun_countdowns_group_event_idx` ON `family_fun_countdowns` (`family_group_id`,`event_at`);--> statement-breakpoint
CREATE INDEX `family_meal_requests_group_status_idx` ON `family_meal_requests` (`family_group_id`,`status`);--> statement-breakpoint
CREATE INDEX `family_memory_quizzes_group_created_idx` ON `family_memory_quizzes` (`family_group_id`,`created_at`);