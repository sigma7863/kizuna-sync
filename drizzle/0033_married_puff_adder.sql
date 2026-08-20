CREATE TABLE `family_evening_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`mood` enum('calm','tired','happy','anxious','grateful') NOT NULL,
	`note` varchar(180),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_evening_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_helped_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`helper_note` varchar(280) NOT NULL,
	`reaction` varchar(80),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_helped_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_walk_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`route_title` varchar(160) NOT NULL,
	`spot_name` varchar(160),
	`memo` varchar(280),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_walk_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_evening_notes_group_created_idx` ON `family_evening_notes` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_helped_memos_group_created_idx` ON `family_helped_memos` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_walk_logs_group_created_idx` ON `family_walk_logs` (`family_group_id`,`created_at`);