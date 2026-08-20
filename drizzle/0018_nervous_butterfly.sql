CREATE TABLE `family_fun_prompts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`content` varchar(240) NOT NULL,
	`theme` varchar(80) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_fun_prompts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_fun_prompts_group_created_idx` ON `family_fun_prompts` (`family_group_id`,`created_at`);