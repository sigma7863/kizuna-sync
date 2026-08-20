CREATE TABLE `family_contact_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`label` varchar(120) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`category` varchar(80) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_contact_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_gentle_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`detail` text,
	`is_agreed` boolean NOT NULL DEFAULT false,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_gentle_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_contact_cards_group_idx` ON `family_contact_cards` (`family_group_id`);--> statement-breakpoint
CREATE INDEX `family_gentle_rules_group_idx` ON `family_gentle_rules` (`family_group_id`);