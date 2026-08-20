CREATE TABLE `family_homecoming_breathers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`breather` varchar(180) NOT NULL,
	`note` varchar(180),
	`is_taken` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_homecoming_breathers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_tried_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`tried_thing` varchar(180) NOT NULL,
	`reflection` varchar(240),
	`is_kept` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_tried_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_weekly_care_themes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`week_key` varchar(10) NOT NULL,
	`theme` varchar(140) NOT NULL,
	`care_hint` varchar(200),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_weekly_care_themes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_homecoming_breathers_group_taken_idx` ON `family_homecoming_breathers` (`family_group_id`,`is_taken`);--> statement-breakpoint
CREATE INDEX `family_tried_memos_group_kept_idx` ON `family_tried_memos` (`family_group_id`,`is_kept`);--> statement-breakpoint
CREATE INDEX `family_weekly_care_themes_group_week_idx` ON `family_weekly_care_themes` (`family_group_id`,`week_key`);