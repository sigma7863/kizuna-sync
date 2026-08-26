CREATE TABLE IF NOT EXISTS `family_theme_preferences` (
  `id` int AUTO_INCREMENT NOT NULL,
  `family_group_id` int NOT NULL,
  `user_id` int NOT NULL,
  `theme_mode` enum('light','dark','system') NOT NULL DEFAULT 'system',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `family_theme_preferences_id` PRIMARY KEY(`id`),
  CONSTRAINT `family_theme_preferences_group_user_unique` UNIQUE(`family_group_id`,`user_id`),
  KEY `family_theme_preferences_group_user_idx` (`family_group_id`,`user_id`)
);
