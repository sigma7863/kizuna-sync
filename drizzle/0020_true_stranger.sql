CREATE TABLE `family_shared_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`owner_user_id` int NOT NULL,
	`borrower_user_id` int,
	`item_name` varchar(160) NOT NULL,
	`note` varchar(240),
	`status` enum('available','borrowed','returned') NOT NULL DEFAULT 'available',
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_shared_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_shared_items_group_status_idx` ON `family_shared_items` (`family_group_id`,`status`);