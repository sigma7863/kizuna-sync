CREATE TABLE `family_help_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`requester_user_id` int NOT NULL,
	`helper_user_id` int,
	`title` varchar(160) NOT NULL,
	`detail` text,
	`status` enum('open','accepted','completed') NOT NULL DEFAULT 'open',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_help_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_help_requests_group_status_idx` ON `family_help_requests` (`family_group_id`,`status`);