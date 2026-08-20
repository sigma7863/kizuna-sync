CREATE TABLE `family_learning_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`source` varchar(180),
	`source_type` enum('book','school','work','other') NOT NULL,
	`insight` varchar(500) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_learning_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_walk_routes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` varchar(500),
	`start_point` varchar(180) NOT NULL,
	`highlights` varchar(500),
	`distance_km` decimal(5,2) NOT NULL,
	`duration_min` int NOT NULL,
	`safety_note` varchar(280),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_walk_routes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_learning_cards_group_created_idx` ON `family_learning_cards` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_walk_routes_group_created_idx` ON `family_walk_routes` (`family_group_id`,`created_at`);