CREATE TABLE `family_mood_reset_ideas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`kind` enum('breath','music','move','rest') NOT NULL,
	`title` varchar(180) NOT NULL,
	`is_tried` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_mood_reset_ideas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_outing_charm_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`kind` enum('item','caution','cheer') NOT NULL,
	`memo` varchar(180) NOT NULL,
	`is_checked` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_outing_charm_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_thanks_relays` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`recipient_hint` varchar(80),
	`message` varchar(180) NOT NULL,
	`is_received` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_thanks_relays_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_mood_reset_ideas_group_tried_idx` ON `family_mood_reset_ideas` (`family_group_id`,`is_tried`);--> statement-breakpoint
CREATE INDEX `family_outing_charm_memos_group_checked_idx` ON `family_outing_charm_memos` (`family_group_id`,`is_checked`);--> statement-breakpoint
CREATE INDEX `family_thanks_relays_group_received_idx` ON `family_thanks_relays` (`family_group_id`,`is_received`);