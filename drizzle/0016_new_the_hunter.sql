CREATE TABLE `family_meal_ideas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`idea_type` enum('want','can_make') NOT NULL,
	`note` varchar(240),
	`is_selected` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_meal_ideas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_meal_ideas_group_selected_idx` ON `family_meal_ideas` (`family_group_id`,`is_selected`);