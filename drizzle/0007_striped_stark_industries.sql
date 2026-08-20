CREATE TABLE `family_album_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`file_key` varchar(512) NOT NULL,
	`image_url` varchar(512) NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`description` text,
	`tags` json,
	`is_favorite` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_album_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_album_photos_group_created_idx` ON `family_album_photos` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_album_photos_group_favorite_idx` ON `family_album_photos` (`family_group_id`,`is_favorite`);