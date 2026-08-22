CREATE TABLE `family_sharing_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`share_location` boolean NOT NULL DEFAULT true,
	`share_health` boolean NOT NULL DEFAULT true,
	`share_check_in` boolean NOT NULL DEFAULT true,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_sharing_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_sharing_preferences_group_user_idx` ON `family_sharing_preferences` (`family_group_id`,`user_id`);