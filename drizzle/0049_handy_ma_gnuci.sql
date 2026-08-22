CREATE TABLE `family_household_tips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`tip` varchar(180) NOT NULL,
	`category` varchar(80),
	`is_helpful` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_household_tips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_packing_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`item` varchar(140) NOT NULL,
	`occasion` varchar(100),
	`is_checked` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_packing_checks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_together_picks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`pick` varchar(180) NOT NULL,
	`kind` varchar(80),
	`is_enjoyed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_together_picks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_household_tips_group_helpful_idx` ON `family_household_tips` (`family_group_id`,`is_helpful`);--> statement-breakpoint
CREATE INDEX `family_packing_checks_group_checked_idx` ON `family_packing_checks` (`family_group_id`,`is_checked`);--> statement-breakpoint
CREATE INDEX `family_together_picks_group_enjoyed_idx` ON `family_together_picks` (`family_group_id`,`is_enjoyed`);