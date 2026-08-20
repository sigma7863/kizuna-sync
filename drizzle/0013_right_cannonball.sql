CREATE TABLE `family_role_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`strengths` json NOT NULL,
	`support_note` varchar(240),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_role_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_role_profiles_group_user_idx` ON `family_role_profiles` (`family_group_id`,`user_id`);