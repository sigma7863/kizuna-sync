CREATE TABLE `family_good_find_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`good_thing` varchar(240) NOT NULL,
	`tag` varchar(80),
	`is_saved` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_good_find_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_monthly_joy_boxes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`month_key` varchar(7) NOT NULL,
	`joy` varchar(180) NOT NULL,
	`is_realized` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_monthly_joy_boxes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_wellbeing_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`state` enum('good','slow','tired','need_space') NOT NULL,
	`support_need` varchar(180),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_wellbeing_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_good_find_group_saved_idx` ON `family_good_find_memos` (`family_group_id`,`is_saved`);--> statement-breakpoint
CREATE INDEX `family_monthly_joy_group_month_idx` ON `family_monthly_joy_boxes` (`family_group_id`,`month_key`);--> statement-breakpoint
CREATE INDEX `family_wellbeing_notes_group_created_idx` ON `family_wellbeing_notes` (`family_group_id`,`created_at`);