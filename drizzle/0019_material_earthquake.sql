CREATE TABLE `family_care_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`sender_user_id` int NOT NULL,
	`recipient_user_id` int,
	`message` varchar(180) NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`read_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_care_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_care_messages_group_read_idx` ON `family_care_messages` (`family_group_id`,`is_read`);