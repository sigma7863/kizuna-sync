CREATE TABLE `geofence_alert_states` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`geofence_id` int NOT NULL,
	`state` enum('inside','outside') NOT NULL DEFAULT 'inside',
	`last_distance_meters` int NOT NULL,
	`last_notified_at` timestamp,
	`acknowledged_at` timestamp,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `geofence_alert_states_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `photo_journal_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`schedule_cron_task_uid` varchar(65),
	`enabled` boolean NOT NULL DEFAULT false,
	`weekday` int NOT NULL DEFAULT 0,
	`hour` int NOT NULL DEFAULT 9,
	`minute` int NOT NULL DEFAULT 0,
	`last_generated_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `photo_journal_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wearable_health_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`steps` int NOT NULL,
	`heart_rate` int NOT NULL,
	`sleep_minutes` int NOT NULL,
	`source` enum('simulated') NOT NULL DEFAULT 'simulated',
	`simulated_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wearable_health_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `photo_journal_schedule_task_uid_idx` ON `photo_journal_schedules` (`schedule_cron_task_uid`);