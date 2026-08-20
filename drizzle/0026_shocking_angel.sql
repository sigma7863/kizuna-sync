CREATE TABLE `family_homecoming_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`mood_sign` varchar(32),
	`note` varchar(180) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_homecoming_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_reading_relay_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`book_title` varchar(180) NOT NULL,
	`page_count` int,
	`quote` varchar(300),
	`reflection` varchar(300),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_reading_relay_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_weather_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`weather` enum('sunny','cloudy','rainy','cold','hot','other') NOT NULL DEFAULT 'other',
	`clothing_note` varchar(180),
	`carrying_note` varchar(180),
	`body_note` varchar(180),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_weather_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_homecoming_notes_group_created_idx` ON `family_homecoming_notes` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_reading_relay_group_created_idx` ON `family_reading_relay_entries` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_weather_memos_group_created_idx` ON `family_weather_memos` (`family_group_id`,`created_at`);