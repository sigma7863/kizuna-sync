CREATE TABLE IF NOT EXISTS `family_feature_layouts` (
  `id` int AUTO_INCREMENT NOT NULL,
  `family_group_id` int NOT NULL,
  `feature_order` json NOT NULL,
  `hidden_features` json NOT NULL,
  `updated_by` int NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `family_feature_layouts_id` PRIMARY KEY(`id`),
  CONSTRAINT `family_feature_layouts_group_unique` UNIQUE(`family_group_id`),
  KEY `family_feature_layouts_group_idx` (`family_group_id`)
);
