CREATE TABLE `family_encouragement_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`sender_user_id` int NOT NULL,
	`recipient_user_id` int,
	`message` varchar(180) NOT NULL,
	`stamp` varchar(16),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_encouragement_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_energy_statuses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`energy_level` int NOT NULL,
	`note` varchar(160),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_energy_statuses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_wish_list_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`category` enum('place','activity','challenge','other') NOT NULL DEFAULT 'activity',
	`note` varchar(240),
	`status` enum('wish','candidate','done') NOT NULL DEFAULT 'wish',
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_wish_list_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_encouragement_posts_group_created_idx` ON `family_encouragement_posts` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_energy_statuses_group_created_idx` ON `family_energy_statuses` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_wish_list_items_group_status_idx` ON `family_wish_list_items` (`family_group_id`,`status`);