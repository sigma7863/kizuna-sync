CREATE TABLE `family_forgotten_item_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`item_name` varchar(160) NOT NULL,
	`note` varchar(240),
	`urgency` enum('soon','urgent') NOT NULL DEFAULT 'soon',
	`is_resolved` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_forgotten_item_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_playlist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`artist` varchar(160),
	`mood` enum('morning','homecoming','weekend','other') NOT NULL DEFAULT 'other',
	`message` varchar(240),
	`link_url` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_playlist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_thank_you_bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`message` varchar(240) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_thank_you_bookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_forgotten_item_alerts_group_resolved_idx` ON `family_forgotten_item_alerts` (`family_group_id`,`is_resolved`);--> statement-breakpoint
CREATE INDEX `family_playlist_items_group_created_idx` ON `family_playlist_items` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_thank_you_bookmarks_group_created_idx` ON `family_thank_you_bookmarks` (`family_group_id`,`created_at`);