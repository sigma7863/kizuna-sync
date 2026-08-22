CREATE TABLE `family_next_step_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`step` varchar(180) NOT NULL,
	`reason` varchar(220),
	`is_taken` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_next_step_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_plan_checkins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`plan` varchar(180) NOT NULL,
	`support_note` varchar(180),
	`is_confirmed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_plan_checkins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_priority_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`priority` varchar(180) NOT NULL,
	`note` varchar(240),
	`is_resolved` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_priority_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_next_step_cards_group_taken_idx` ON `family_next_step_cards` (`family_group_id`,`is_taken`);--> statement-breakpoint
CREATE INDEX `family_plan_checkins_group_confirmed_idx` ON `family_plan_checkins` (`family_group_id`,`is_confirmed`);--> statement-breakpoint
CREATE INDEX `family_priority_memos_group_resolved_idx` ON `family_priority_memos` (`family_group_id`,`is_resolved`);