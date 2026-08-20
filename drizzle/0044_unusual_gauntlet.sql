CREATE TABLE `family_discovery_shares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`discovery` varchar(240) NOT NULL,
	`source_hint` varchar(120),
	`is_saved` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_discovery_shares_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_helping_hands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`situation` varchar(160) NOT NULL,
	`small_action` varchar(240) NOT NULL,
	`is_helpful` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_helping_hands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_weekend_calm_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`plan` varchar(180) NOT NULL,
	`timing_hint` varchar(120),
	`is_enjoyed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_weekend_calm_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_discovery_shares_group_saved_idx` ON `family_discovery_shares` (`family_group_id`,`is_saved`);--> statement-breakpoint
CREATE INDEX `family_helping_hands_group_helpful_idx` ON `family_helping_hands` (`family_group_id`,`is_helpful`);--> statement-breakpoint
CREATE INDEX `family_weekend_calm_group_enjoyed_idx` ON `family_weekend_calm_plans` (`family_group_id`,`is_enjoyed`);