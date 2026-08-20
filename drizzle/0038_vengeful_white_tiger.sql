CREATE TABLE `family_daily_joys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`day_key` varchar(10) NOT NULL,
	`joy` varchar(180) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_daily_joys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_daily_joys_group_day_idx` ON `family_daily_joys` (`family_group_id`,`day_key`);