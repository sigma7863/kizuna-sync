CREATE TABLE `family_daily_moments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`photo_id` int,
	`mood_sign` varchar(32),
	`note` varchar(280) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_daily_moments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_movement_bingo_cells` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`label` varchar(100) NOT NULL,
	`icon` varchar(16),
	`is_completed` boolean NOT NULL DEFAULT false,
	`completed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_movement_bingo_cells_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_take_home_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`category` enum('school','work','outing','other') NOT NULL DEFAULT 'other',
	`title` varchar(160) NOT NULL,
	`content` varchar(500) NOT NULL,
	`is_resolved` boolean NOT NULL DEFAULT false,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_take_home_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_daily_moments_group_created_idx` ON `family_daily_moments` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_movement_bingo_cells_group_done_idx` ON `family_movement_bingo_cells` (`family_group_id`,`is_completed`);--> statement-breakpoint
CREATE INDEX `family_take_home_notes_group_resolved_idx` ON `family_take_home_notes` (`family_group_id`,`is_resolved`);