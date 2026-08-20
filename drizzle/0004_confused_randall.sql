CREATE TABLE `notification_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`family_group_id` int NOT NULL,
	`vibration_enabled` boolean NOT NULL DEFAULT true,
	`sound_enabled` boolean NOT NULL DEFAULT false,
	`banner_enabled` boolean NOT NULL DEFAULT true,
	`quiet_mode` boolean NOT NULL DEFAULT true,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_settings_id` PRIMARY KEY(`id`)
);
