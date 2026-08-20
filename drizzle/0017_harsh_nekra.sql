CREATE TABLE `family_care_duties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`assigned_user_id` int,
	`care_target` varchar(80) NOT NULL,
	`title` varchar(180) NOT NULL,
	`due_on` timestamp,
	`status` enum('open','done') NOT NULL DEFAULT 'open',
	`completed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_care_duties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_care_duties_group_status_idx` ON `family_care_duties` (`family_group_id`,`status`);