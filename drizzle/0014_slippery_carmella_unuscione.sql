CREATE TABLE `family_bookshelf_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`resource_type` enum('book','video','article') NOT NULL,
	`theme` varchar(80) NOT NULL,
	`resource_url` varchar(512),
	`note` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_bookshelf_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_bookshelf_items_group_created_idx` ON `family_bookshelf_items` (`family_group_id`,`created_at`);