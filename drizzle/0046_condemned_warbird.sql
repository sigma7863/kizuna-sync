CREATE TABLE `family_appreciation_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`recipient_name` varchar(80) NOT NULL,
	`message` varchar(220) NOT NULL,
	`is_seen` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_appreciation_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_conversation_topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`topic` varchar(180) NOT NULL,
	`note` varchar(240),
	`is_discussed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_conversation_topics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_journal_relay_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`daily_key` varchar(10) NOT NULL,
	`entry` varchar(220) NOT NULL,
	`is_passed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_journal_relay_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_appreciation_cards_group_seen_idx` ON `family_appreciation_cards` (`family_group_id`,`is_seen`);--> statement-breakpoint
CREATE INDEX `family_conversation_topics_group_discussed_idx` ON `family_conversation_topics` (`family_group_id`,`is_discussed`);--> statement-breakpoint
CREATE INDEX `family_journal_relay_entries_group_day_idx` ON `family_journal_relay_entries` (`family_group_id`,`daily_key`);