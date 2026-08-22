CREATE TABLE `family_notice_boards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`notice` varchar(220) NOT NULL,
	`detail` varchar(240),
	`is_acknowledged` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_notice_boards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_place_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`place_name` varchar(160) NOT NULL,
	`reason` varchar(220),
	`is_visited` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_place_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_role_batons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`task` varchar(180) NOT NULL,
	`next_person` varchar(80),
	`is_completed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_role_batons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_notice_boards_group_ack_idx` ON `family_notice_boards` (`family_group_id`,`is_acknowledged`);--> statement-breakpoint
CREATE INDEX `family_place_cards_group_visited_idx` ON `family_place_cards` (`family_group_id`,`is_visited`);--> statement-breakpoint
CREATE INDEX `family_role_batons_group_completed_idx` ON `family_role_batons` (`family_group_id`,`is_completed`);