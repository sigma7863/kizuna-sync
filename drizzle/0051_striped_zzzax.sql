CREATE TABLE `family_check_in_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`status` enum('okay','rest','available') NOT NULL,
	`is_shared` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_check_in_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_check_in_records_group_user_created_idx` ON `family_check_in_records` (`family_group_id`,`user_id`,`created_at`);