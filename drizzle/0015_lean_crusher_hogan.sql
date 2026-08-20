CREATE TABLE `family_outing_checklist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`outing_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`label` varchar(180) NOT NULL,
	`is_completed` boolean NOT NULL DEFAULT false,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_outing_checklist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_outings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`meeting_at` timestamp NOT NULL,
	`meeting_place` varchar(180),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_outings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_outing_checklist_items_outing_done_idx` ON `family_outing_checklist_items` (`outing_id`,`is_completed`);--> statement-breakpoint
CREATE INDEX `family_outings_group_meeting_idx` ON `family_outings` (`family_group_id`,`meeting_at`);