CREATE TABLE `family_later_listen_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`note` varchar(240),
	`is_followed_up` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_later_listen_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_meeting_markers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`location_hint` varchar(160) NOT NULL,
	`appearance_hint` varchar(160),
	`note` varchar(180),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_meeting_markers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_table_topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`tone` enum('laugh','share','think') NOT NULL,
	`topic` varchar(180) NOT NULL,
	`is_discussed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_table_topics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_later_listen_group_followed_idx` ON `family_later_listen_memos` (`family_group_id`,`is_followed_up`);--> statement-breakpoint
CREATE INDEX `family_meeting_markers_group_active_idx` ON `family_meeting_markers` (`family_group_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `family_table_topics_group_discussed_idx` ON `family_table_topics` (`family_group_id`,`is_discussed`);