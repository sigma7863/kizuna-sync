CREATE TABLE `family_calm_moments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`moment` varchar(240) NOT NULL,
	`is_kept` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_calm_moments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_tomorrow_preparation_relays` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`preparation` varchar(180) NOT NULL,
	`relay_note` varchar(180),
	`is_ready` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_tomorrow_preparation_relays_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_week_start_declarations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`week_key` varchar(10) NOT NULL,
	`declaration` varchar(180) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_week_start_declarations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_calm_moments_group_kept_idx` ON `family_calm_moments` (`family_group_id`,`is_kept`);--> statement-breakpoint
CREATE INDEX `family_tomorrow_relay_group_ready_idx` ON `family_tomorrow_preparation_relays` (`family_group_id`,`is_ready`);--> statement-breakpoint
CREATE INDEX `family_week_start_group_week_idx` ON `family_week_start_declarations` (`family_group_id`,`week_key`);