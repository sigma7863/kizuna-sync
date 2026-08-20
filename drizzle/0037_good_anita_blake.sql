CREATE TABLE `family_comfort_meters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`color` enum('sunny','soft','cloudy','rainy') NOT NULL,
	`message` varchar(160),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_comfort_meters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_rainy_day_ideas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`detail` varchar(240),
	`mood` enum('quiet','creative','active') NOT NULL,
	`is_tried` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_rainy_day_ideas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_together_invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`kind` enum('chore','hobby','other') NOT NULL,
	`title` varchar(160) NOT NULL,
	`note` varchar(240),
	`is_closed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_together_invitations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_together_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invitation_id` int NOT NULL,
	`user_id` int NOT NULL,
	`response` enum('join','maybe') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_together_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_comfort_meters_group_created_idx` ON `family_comfort_meters` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_rainy_day_ideas_group_tried_idx` ON `family_rainy_day_ideas` (`family_group_id`,`is_tried`);--> statement-breakpoint
CREATE INDEX `family_together_invitations_group_closed_idx` ON `family_together_invitations` (`family_group_id`,`is_closed`);--> statement-breakpoint
CREATE INDEX `family_together_responses_invitation_idx` ON `family_together_responses` (`invitation_id`);