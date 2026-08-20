CREATE TABLE `family_care_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`reaction` varchar(80) NOT NULL,
	`message` varchar(180),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_care_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_consultation_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`kind` enum('listen','advice','help') NOT NULL,
	`title` varchar(160) NOT NULL,
	`detail` varchar(500),
	`is_resolved` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_consultation_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_seasonal_ideas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`season` enum('spring','summer','autumn','winter','anytime') NOT NULL,
	`title` varchar(160) NOT NULL,
	`note` varchar(240),
	`is_planned` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_seasonal_ideas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_care_replies_group_created_idx` ON `family_care_replies` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_consultation_cards_group_resolved_idx` ON `family_consultation_cards` (`family_group_id`,`is_resolved`);--> statement-breakpoint
CREATE INDEX `family_seasonal_ideas_group_season_idx` ON `family_seasonal_ideas` (`family_group_id`,`season`);