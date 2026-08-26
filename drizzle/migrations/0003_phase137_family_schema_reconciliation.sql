CREATE TABLE `family_achievement_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`category` enum('help','movement','challenge','other') NOT NULL DEFAULT 'other',
	`note` varchar(240),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_achievement_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_album_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`file_key` varchar(512) NOT NULL,
	`image_url` varchar(512) NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`description` text,
	`tags` json,
	`is_favorite` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_album_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_appreciation_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`recipient_name` varchar(80) NOT NULL,
	`message` varchar(220) NOT NULL,
	`is_seen` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_appreciation_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_bedtime_preparation_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`kind` enum('bag','clothes','plan','care') NOT NULL,
	`memo` varchar(180) NOT NULL,
	`is_prepared` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_bedtime_preparation_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_bookshelf_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`resource_type` enum('book','video','article') NOT NULL,
	`theme` varchar(80) NOT NULL,
	`resource_url` varchar(512),
	`note` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_bookshelf_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `family_care_duties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`assigned_user_id` int,
	`care_target` varchar(80) NOT NULL,
	`title` varchar(180) NOT NULL,
	`due_on` timestamp,
	`status` enum('open','done') NOT NULL DEFAULT 'open',
	`completed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_care_duties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_care_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`sender_user_id` int NOT NULL,
	`recipient_user_id` int,
	`message` varchar(180) NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`read_at` timestamp,
	`recipient_response` enum('unread','read','later') NOT NULL DEFAULT 'unread',
	`response_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_care_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_care_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`reaction` varchar(80) NOT NULL,
	`message` varchar(180),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_care_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_celebration_dates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`celebration_at` timestamp NOT NULL,
	`schedule_cron_task_uid` varchar(65),
	`celebrated_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_celebration_dates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `family_consultation_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`kind` enum('listen','advice','help') NOT NULL,
	`title` varchar(160) NOT NULL,
	`detail` varchar(500),
	`is_resolved` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_consultation_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_contact_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`label` varchar(120) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`category` varchar(80) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_contact_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_conversation_topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`topic` varchar(180) NOT NULL,
	`note` varchar(240),
	`is_discussed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_conversation_topics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_daily_joys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`day_key` varchar(10) NOT NULL,
	`joy` varchar(180) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_daily_joys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_daily_moments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`photo_id` int,
	`mood_sign` varchar(32),
	`note` varchar(280) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_daily_moments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_daily_question_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`question_id` int NOT NULL,
	`user_id` int NOT NULL,
	`answer` varchar(280) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_daily_question_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_daily_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`day_key` varchar(10) NOT NULL,
	`question` varchar(280) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_daily_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `family_encouragement_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`sender_user_id` int NOT NULL,
	`recipient_user_id` int,
	`message` varchar(180) NOT NULL,
	`stamp` varchar(16),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_encouragement_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_encouragement_stamps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`stamp` enum('sun','heart','clap','rainbow') NOT NULL,
	`message` varchar(180),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_encouragement_stamps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_energy_statuses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`energy_level` int NOT NULL,
	`note` varchar(160),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_energy_statuses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_evening_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`mood` enum('calm','tired','happy','anxious','grateful') NOT NULL,
	`note` varchar(180),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_evening_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_forgotten_item_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`item_name` varchar(160) NOT NULL,
	`note` varchar(240),
	`urgency` enum('soon','urgent') NOT NULL DEFAULT 'soon',
	`is_resolved` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_forgotten_item_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_fun_countdowns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`event_at` timestamp NOT NULL,
	`note` varchar(240),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_fun_countdowns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `family_gentle_reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`note` varchar(240),
	`due_at` timestamp,
	`is_completed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_gentle_reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_gentle_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`detail` text,
	`is_agreed` boolean NOT NULL DEFAULT false,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_gentle_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_good_find_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`good_thing` varchar(240) NOT NULL,
	`tag` varchar(80),
	`is_saved` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_good_find_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_help_guides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`category` enum('housework','device','health','other') NOT NULL,
	`title` varchar(160) NOT NULL,
	`steps` varchar(600) NOT NULL,
	`is_pinned` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_help_guides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_helped_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`helper_note` varchar(280) NOT NULL,
	`reaction` varchar(80),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_helped_memos_id` PRIMARY KEY(`id`)
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
CREATE TABLE `family_home_preparation_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`note` varchar(240),
	`is_completed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_home_preparation_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_homecoming_breathers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`breather` varchar(180) NOT NULL,
	`note` varchar(180),
	`is_taken` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_homecoming_breathers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_homecoming_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`mood_sign` varchar(32),
	`note` varchar(180) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_homecoming_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `family_journal_relay_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`daily_key` varchar(10) NOT NULL,
	`entry` varchar(220) NOT NULL,
	`is_passed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_journal_relay_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_later_listen_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`note` varchar(240),
	`is_followed_up` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_later_listen_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_learning_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`source` varchar(180),
	`source_type` enum('book','school','work','other') NOT NULL,
	`insight` varchar(500) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_learning_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_meal_ideas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`idea_type` enum('want','can_make') NOT NULL,
	`note` varchar(240),
	`is_selected` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_meal_ideas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_meal_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`dish_name` varchar(160) NOT NULL,
	`reason` varchar(240),
	`status` enum('open','planned','served') NOT NULL DEFAULT 'open',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_meal_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_meeting_markers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`location_hint` varchar(160) NOT NULL,
	`appearance_hint` varchar(160),
	`note` varchar(180),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_meeting_markers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_memory_bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`source_type` enum('photo','post','other') NOT NULL,
	`source_label` varchar(160) NOT NULL,
	`reason` varchar(280) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_memory_bookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_memory_quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`question` varchar(300) NOT NULL,
	`option_a` varchar(180) NOT NULL,
	`option_b` varchar(180) NOT NULL,
	`option_c` varchar(180) NOT NULL,
	`correct_answer` enum('a','b','c') NOT NULL,
	`hint` varchar(240),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_memory_quizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_monthly_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` varchar(240),
	`target_count` int NOT NULL,
	`progress_count` int NOT NULL DEFAULT 0,
	`celebration_note` varchar(180),
	`is_completed` boolean NOT NULL DEFAULT false,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_monthly_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_monthly_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`month_key` varchar(7) NOT NULL,
	`title` varchar(160) NOT NULL,
	`encouragement` varchar(240),
	`is_completed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_monthly_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_monthly_joy_boxes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`month_key` varchar(7) NOT NULL,
	`joy` varchar(180) NOT NULL,
	`is_realized` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_monthly_joy_boxes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_mood_reset_ideas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`kind` enum('breath','music','move','rest') NOT NULL,
	`title` varchar(180) NOT NULL,
	`is_tried` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_mood_reset_ideas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_morning_encouragements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`message` varchar(180) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_morning_encouragements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_morning_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`departure_time` varchar(5),
	`mood_sign` varchar(32),
	`carrying_items` varchar(280),
	`is_ready` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_morning_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_movement_bingo_cells` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`label` varchar(100) NOT NULL,
	`icon` varchar(16),
	`is_completed` boolean NOT NULL DEFAULT false,
	`completed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_movement_bingo_cells_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_next_step_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`step` varchar(180) NOT NULL,
	`reason` varchar(220),
	`is_taken` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_next_step_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_notice_boards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`notice` varchar(220) NOT NULL,
	`detail` varchar(240),
	`is_acknowledged` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_notice_boards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_outing_charm_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`kind` enum('item','caution','cheer') NOT NULL,
	`memo` varchar(180) NOT NULL,
	`is_checked` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_outing_charm_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `family_photo_captions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`photo_id` int NOT NULL,
	`caption` varchar(280) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_photo_captions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_place_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`place_name` varchar(160) NOT NULL,
	`reason` varchar(220),
	`is_visited` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_place_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_plan_checkins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`plan` varchar(180) NOT NULL,
	`support_note` varchar(180),
	`is_confirmed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_plan_checkins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_playlist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`artist` varchar(160),
	`mood` enum('morning','homecoming','weekend','other') NOT NULL DEFAULT 'other',
	`message` varchar(240),
	`link_url` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_playlist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_poll_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`poll_id` int NOT NULL,
	`respondent_user_id` int NOT NULL,
	`option_index` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_poll_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_polls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`creator_user_id` int NOT NULL,
	`question` varchar(240) NOT NULL,
	`options` json NOT NULL,
	`ends_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_polls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_priority_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`priority` varchar(180) NOT NULL,
	`note` varchar(240),
	`is_resolved` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_priority_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_question_box_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`question` varchar(280) NOT NULL,
	`is_anonymous` boolean NOT NULL DEFAULT false,
	`is_opened` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_question_box_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_quiet_time_signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`state` enum('focus','rest','sleeping') NOT NULL,
	`note` varchar(180),
	`until_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_quiet_time_signals_id` PRIMARY KEY(`id`)
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
CREATE TABLE `family_reading_relay_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`book_title` varchar(180) NOT NULL,
	`page_count` int,
	`quote` varchar(300),
	`reflection` varchar(300),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_reading_relay_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_role_batons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`task` varchar(180) NOT NULL,
	`next_person` varchar(80),
	`is_completed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_role_batons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_role_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`strengths` json NOT NULL,
	`support_note` varchar(240),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_role_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_safety_checklist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`label` varchar(180) NOT NULL,
	`category` varchar(80) NOT NULL,
	`is_completed` boolean NOT NULL DEFAULT false,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_safety_checklist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_seasonal_ideas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`season` enum('spring','summer','autumn','winter','anytime') NOT NULL,
	`title` varchar(160) NOT NULL,
	`note` varchar(240),
	`is_planned` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_seasonal_ideas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_seasonal_photo_prompts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`month_key` varchar(7) NOT NULL,
	`theme` varchar(160) NOT NULL,
	`detail` varchar(240),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_seasonal_photo_prompts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_shared_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`owner_user_id` int NOT NULL,
	`borrower_user_id` int,
	`item_name` varchar(160) NOT NULL,
	`note` varchar(240),
	`status` enum('available','borrowed','returned') NOT NULL DEFAULT 'available',
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_shared_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_table_topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`tone` enum('laugh','share','think') NOT NULL,
	`topic` varchar(180) NOT NULL,
	`is_discussed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_table_topics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_take_home_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`category` enum('school','work','outing','other') NOT NULL DEFAULT 'other',
	`title` varchar(160) NOT NULL,
	`content` varchar(500) NOT NULL,
	`is_resolved` boolean NOT NULL DEFAULT false,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_take_home_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_talk_timings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`state` enum('available','later','quiet') NOT NULL,
	`note` varchar(160),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_talk_timings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_thank_you_bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`message` varchar(240) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_thank_you_bookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_thanks_relays` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`recipient_hint` varchar(80),
	`message` varchar(180) NOT NULL,
	`is_received` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_thanks_relays_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_time_capsules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`creator_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`message` text NOT NULL,
	`opens_at` timestamp NOT NULL,
	`opened_at` timestamp,
	`schedule_cron_task_uid` varchar(65),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_time_capsules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_tiny_achievement_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`kind` enum('kindness','effort','bravery','care') NOT NULL,
	`title` varchar(160) NOT NULL,
	`is_celebrated` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_tiny_achievement_badges_id` PRIMARY KEY(`id`)
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
CREATE TABLE `family_together_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invitation_id` int NOT NULL,
	`user_id` int NOT NULL,
	`response` enum('join','maybe') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_together_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_tomorrow_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`target_date` timestamp NOT NULL,
	`kind` enum('plan','care','fun') NOT NULL,
	`note` varchar(280) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_tomorrow_memos_id` PRIMARY KEY(`id`)
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
CREATE TABLE `family_tried_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`tried_thing` varchar(180) NOT NULL,
	`reflection` varchar(240),
	`is_kept` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_tried_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_voice_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`file_key` varchar(512) NOT NULL,
	`audio_url` varchar(512) NOT NULL,
	`mime_type` varchar(64) NOT NULL,
	`duration_seconds` int NOT NULL,
	`note` varchar(180),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_voice_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_walk_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`route_title` varchar(160) NOT NULL,
	`spot_name` varchar(160),
	`memo` varchar(280),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_walk_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_walk_routes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` varchar(500),
	`start_point` varchar(180) NOT NULL,
	`highlights` varchar(500),
	`distance_km` decimal(5,2) NOT NULL,
	`duration_min` int NOT NULL,
	`safety_note` varchar(280),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_walk_routes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_weather_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`weather` enum('sunny','cloudy','rainy','cold','hot','other') NOT NULL DEFAULT 'other',
	`clothing_note` varchar(180),
	`carrying_note` varchar(180),
	`body_note` varchar(180),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_weather_memos_id` PRIMARY KEY(`id`)
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
CREATE TABLE `family_weekend_homecoming_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`planned_at` timestamp NOT NULL,
	`meeting_place` varchar(160),
	`note` varchar(240),
	`is_confirmed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_weekend_homecoming_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_weekend_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` text,
	`activity_type` enum('indoor','outdoor','hybrid') NOT NULL,
	`shared_poll_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_weekend_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_weekend_reflections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`week_key` varchar(10) NOT NULL,
	`good_thing` varchar(280) NOT NULL,
	`next_hope` varchar(280),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_weekend_reflections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_weekly_care_themes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`week_key` varchar(10) NOT NULL,
	`theme` varchar(140) NOT NULL,
	`care_hint` varchar(200),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_weekly_care_themes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_weekly_cheer_themes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`week_key` varchar(10) NOT NULL,
	`theme` varchar(120) NOT NULL,
	`support` varchar(180),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_weekly_cheer_themes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_weekly_promises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`week_key` varchar(10) NOT NULL,
	`title` varchar(160) NOT NULL,
	`note` varchar(240),
	`is_completed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_weekly_promises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_wellbeing_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`state` enum('good','slow','tired','need_space') NOT NULL,
	`support_need` varchar(180),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_wellbeing_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_wish_list_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_group_id` int NOT NULL,
	`created_by_user_id` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`category` enum('place','activity','challenge','other') NOT NULL DEFAULT 'activity',
	`note` varchar(240),
	`status` enum('wish','candidate','done') NOT NULL DEFAULT 'wish',
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_wish_list_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`endpoint` text NOT NULL,
	`auth` varchar(255) NOT NULL,
	`p256dh` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `family_achievement_entries_group_created_idx` ON `family_achievement_entries` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_album_photos_group_created_idx` ON `family_album_photos` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_album_photos_group_favorite_idx` ON `family_album_photos` (`family_group_id`,`is_favorite`);--> statement-breakpoint
CREATE INDEX `family_appreciation_cards_group_seen_idx` ON `family_appreciation_cards` (`family_group_id`,`is_seen`);--> statement-breakpoint
CREATE INDEX `family_bedtime_prep_group_prepared_idx` ON `family_bedtime_preparation_memos` (`family_group_id`,`is_prepared`);--> statement-breakpoint
CREATE INDEX `family_bookshelf_items_group_created_idx` ON `family_bookshelf_items` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_calm_moments_group_kept_idx` ON `family_calm_moments` (`family_group_id`,`is_kept`);--> statement-breakpoint
CREATE INDEX `family_care_duties_group_status_idx` ON `family_care_duties` (`family_group_id`,`status`);--> statement-breakpoint
CREATE INDEX `family_care_messages_group_read_idx` ON `family_care_messages` (`family_group_id`,`is_read`);--> statement-breakpoint
CREATE INDEX `family_care_replies_group_created_idx` ON `family_care_replies` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_celebration_dates_group_at_idx` ON `family_celebration_dates` (`family_group_id`,`celebration_at`);--> statement-breakpoint
CREATE INDEX `family_celebration_dates_task_uid_idx` ON `family_celebration_dates` (`schedule_cron_task_uid`);--> statement-breakpoint
CREATE INDEX `family_comfort_meters_group_created_idx` ON `family_comfort_meters` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_consultation_cards_group_resolved_idx` ON `family_consultation_cards` (`family_group_id`,`is_resolved`);--> statement-breakpoint
CREATE INDEX `family_contact_cards_group_idx` ON `family_contact_cards` (`family_group_id`);--> statement-breakpoint
CREATE INDEX `family_conversation_topics_group_discussed_idx` ON `family_conversation_topics` (`family_group_id`,`is_discussed`);--> statement-breakpoint
CREATE INDEX `family_daily_joys_group_day_idx` ON `family_daily_joys` (`family_group_id`,`day_key`);--> statement-breakpoint
CREATE INDEX `family_daily_moments_group_created_idx` ON `family_daily_moments` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_daily_question_answers_question_idx` ON `family_daily_question_answers` (`family_group_id`,`question_id`);--> statement-breakpoint
CREATE INDEX `family_daily_questions_group_day_idx` ON `family_daily_questions` (`family_group_id`,`day_key`);--> statement-breakpoint
CREATE INDEX `family_discovery_shares_group_saved_idx` ON `family_discovery_shares` (`family_group_id`,`is_saved`);--> statement-breakpoint
CREATE INDEX `family_encouragement_posts_group_created_idx` ON `family_encouragement_posts` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_encouragement_stamps_group_created_idx` ON `family_encouragement_stamps` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_energy_statuses_group_created_idx` ON `family_energy_statuses` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_evening_notes_group_created_idx` ON `family_evening_notes` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_forgotten_item_alerts_group_resolved_idx` ON `family_forgotten_item_alerts` (`family_group_id`,`is_resolved`);--> statement-breakpoint
CREATE INDEX `family_fun_countdowns_group_event_idx` ON `family_fun_countdowns` (`family_group_id`,`event_at`);--> statement-breakpoint
CREATE INDEX `family_fun_prompts_group_created_idx` ON `family_fun_prompts` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_gentle_reminders_group_completed_idx` ON `family_gentle_reminders` (`family_group_id`,`is_completed`);--> statement-breakpoint
CREATE INDEX `family_gentle_rules_group_idx` ON `family_gentle_rules` (`family_group_id`);--> statement-breakpoint
CREATE INDEX `family_good_find_group_saved_idx` ON `family_good_find_memos` (`family_group_id`,`is_saved`);--> statement-breakpoint
CREATE INDEX `family_help_guides_group_pinned_idx` ON `family_help_guides` (`family_group_id`,`is_pinned`);--> statement-breakpoint
CREATE INDEX `family_helped_memos_group_created_idx` ON `family_helped_memos` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_helping_hands_group_helpful_idx` ON `family_helping_hands` (`family_group_id`,`is_helpful`);--> statement-breakpoint
CREATE INDEX `family_home_preparation_group_completed_idx` ON `family_home_preparation_items` (`family_group_id`,`is_completed`);--> statement-breakpoint
CREATE INDEX `family_homecoming_breathers_group_taken_idx` ON `family_homecoming_breathers` (`family_group_id`,`is_taken`);--> statement-breakpoint
CREATE INDEX `family_homecoming_notes_group_created_idx` ON `family_homecoming_notes` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_household_tips_group_helpful_idx` ON `family_household_tips` (`family_group_id`,`is_helpful`);--> statement-breakpoint
CREATE INDEX `family_journal_relay_entries_group_day_idx` ON `family_journal_relay_entries` (`family_group_id`,`daily_key`);--> statement-breakpoint
CREATE INDEX `family_later_listen_group_followed_idx` ON `family_later_listen_memos` (`family_group_id`,`is_followed_up`);--> statement-breakpoint
CREATE INDEX `family_learning_cards_group_created_idx` ON `family_learning_cards` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_meal_ideas_group_selected_idx` ON `family_meal_ideas` (`family_group_id`,`is_selected`);--> statement-breakpoint
CREATE INDEX `family_meal_requests_group_status_idx` ON `family_meal_requests` (`family_group_id`,`status`);--> statement-breakpoint
CREATE INDEX `family_meeting_markers_group_active_idx` ON `family_meeting_markers` (`family_group_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `family_memory_bookmarks_group_created_idx` ON `family_memory_bookmarks` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_memory_quizzes_group_created_idx` ON `family_memory_quizzes` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_monthly_challenges_group_done_idx` ON `family_monthly_challenges` (`family_group_id`,`is_completed`);--> statement-breakpoint
CREATE INDEX `family_monthly_goals_group_month_idx` ON `family_monthly_goals` (`family_group_id`,`month_key`);--> statement-breakpoint
CREATE INDEX `family_monthly_joy_group_month_idx` ON `family_monthly_joy_boxes` (`family_group_id`,`month_key`);--> statement-breakpoint
CREATE INDEX `family_mood_reset_ideas_group_tried_idx` ON `family_mood_reset_ideas` (`family_group_id`,`is_tried`);--> statement-breakpoint
CREATE INDEX `family_morning_encouragements_group_created_idx` ON `family_morning_encouragements` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_morning_plans_group_created_idx` ON `family_morning_plans` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_movement_bingo_cells_group_done_idx` ON `family_movement_bingo_cells` (`family_group_id`,`is_completed`);--> statement-breakpoint
CREATE INDEX `family_next_step_cards_group_taken_idx` ON `family_next_step_cards` (`family_group_id`,`is_taken`);--> statement-breakpoint
CREATE INDEX `family_notice_boards_group_ack_idx` ON `family_notice_boards` (`family_group_id`,`is_acknowledged`);--> statement-breakpoint
CREATE INDEX `family_outing_charm_memos_group_checked_idx` ON `family_outing_charm_memos` (`family_group_id`,`is_checked`);--> statement-breakpoint
CREATE INDEX `family_outing_checklist_items_outing_done_idx` ON `family_outing_checklist_items` (`outing_id`,`is_completed`);--> statement-breakpoint
CREATE INDEX `family_outings_group_meeting_idx` ON `family_outings` (`family_group_id`,`meeting_at`);--> statement-breakpoint
CREATE INDEX `family_packing_checks_group_checked_idx` ON `family_packing_checks` (`family_group_id`,`is_checked`);--> statement-breakpoint
CREATE INDEX `family_photo_captions_group_photo_idx` ON `family_photo_captions` (`family_group_id`,`photo_id`);--> statement-breakpoint
CREATE INDEX `family_place_cards_group_visited_idx` ON `family_place_cards` (`family_group_id`,`is_visited`);--> statement-breakpoint
CREATE INDEX `family_plan_checkins_group_confirmed_idx` ON `family_plan_checkins` (`family_group_id`,`is_confirmed`);--> statement-breakpoint
CREATE INDEX `family_playlist_items_group_created_idx` ON `family_playlist_items` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_poll_responses_poll_user_idx` ON `family_poll_responses` (`poll_id`,`respondent_user_id`);--> statement-breakpoint
CREATE INDEX `family_polls_group_ends_idx` ON `family_polls` (`family_group_id`,`ends_at`);--> statement-breakpoint
CREATE INDEX `family_priority_memos_group_resolved_idx` ON `family_priority_memos` (`family_group_id`,`is_resolved`);--> statement-breakpoint
CREATE INDEX `family_question_box_entries_group_opened_idx` ON `family_question_box_entries` (`family_group_id`,`is_opened`);--> statement-breakpoint
CREATE INDEX `family_quiet_time_signals_group_created_idx` ON `family_quiet_time_signals` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_rainy_day_ideas_group_tried_idx` ON `family_rainy_day_ideas` (`family_group_id`,`is_tried`);--> statement-breakpoint
CREATE INDEX `family_reading_relay_group_created_idx` ON `family_reading_relay_entries` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_role_batons_group_completed_idx` ON `family_role_batons` (`family_group_id`,`is_completed`);--> statement-breakpoint
CREATE INDEX `family_role_profiles_group_user_idx` ON `family_role_profiles` (`family_group_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `family_safety_checklist_group_done_idx` ON `family_safety_checklist_items` (`family_group_id`,`is_completed`);--> statement-breakpoint
CREATE INDEX `family_seasonal_ideas_group_season_idx` ON `family_seasonal_ideas` (`family_group_id`,`season`);--> statement-breakpoint
CREATE INDEX `family_seasonal_photo_prompts_group_month_idx` ON `family_seasonal_photo_prompts` (`family_group_id`,`month_key`);--> statement-breakpoint
CREATE INDEX `family_shared_items_group_status_idx` ON `family_shared_items` (`family_group_id`,`status`);--> statement-breakpoint
CREATE INDEX `family_table_topics_group_discussed_idx` ON `family_table_topics` (`family_group_id`,`is_discussed`);--> statement-breakpoint
CREATE INDEX `family_take_home_notes_group_resolved_idx` ON `family_take_home_notes` (`family_group_id`,`is_resolved`);--> statement-breakpoint
CREATE INDEX `family_talk_timings_group_created_idx` ON `family_talk_timings` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_thank_you_bookmarks_group_created_idx` ON `family_thank_you_bookmarks` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_thanks_relays_group_received_idx` ON `family_thanks_relays` (`family_group_id`,`is_received`);--> statement-breakpoint
CREATE INDEX `family_time_capsules_group_opens_idx` ON `family_time_capsules` (`family_group_id`,`opens_at`);--> statement-breakpoint
CREATE INDEX `family_time_capsules_task_uid_idx` ON `family_time_capsules` (`schedule_cron_task_uid`);--> statement-breakpoint
CREATE INDEX `family_tiny_badges_group_celebrated_idx` ON `family_tiny_achievement_badges` (`family_group_id`,`is_celebrated`);--> statement-breakpoint
CREATE INDEX `family_together_invitations_group_closed_idx` ON `family_together_invitations` (`family_group_id`,`is_closed`);--> statement-breakpoint
CREATE INDEX `family_together_picks_group_enjoyed_idx` ON `family_together_picks` (`family_group_id`,`is_enjoyed`);--> statement-breakpoint
CREATE INDEX `family_together_responses_invitation_idx` ON `family_together_responses` (`invitation_id`);--> statement-breakpoint
CREATE INDEX `family_tomorrow_memos_group_target_idx` ON `family_tomorrow_memos` (`family_group_id`,`target_date`);--> statement-breakpoint
CREATE INDEX `family_tomorrow_relay_group_ready_idx` ON `family_tomorrow_preparation_relays` (`family_group_id`,`is_ready`);--> statement-breakpoint
CREATE INDEX `family_tried_memos_group_kept_idx` ON `family_tried_memos` (`family_group_id`,`is_kept`);--> statement-breakpoint
CREATE INDEX `family_voice_memos_group_created_idx` ON `family_voice_memos` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_walk_logs_group_created_idx` ON `family_walk_logs` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_walk_routes_group_created_idx` ON `family_walk_routes` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_weather_memos_group_created_idx` ON `family_weather_memos` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_week_start_group_week_idx` ON `family_week_start_declarations` (`family_group_id`,`week_key`);--> statement-breakpoint
CREATE INDEX `family_weekend_calm_group_enjoyed_idx` ON `family_weekend_calm_plans` (`family_group_id`,`is_enjoyed`);--> statement-breakpoint
CREATE INDEX `family_weekend_homecoming_plans_group_planned_idx` ON `family_weekend_homecoming_plans` (`family_group_id`,`planned_at`);--> statement-breakpoint
CREATE INDEX `family_weekend_plans_group_created_idx` ON `family_weekend_plans` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_weekend_plans_group_shared_idx` ON `family_weekend_plans` (`family_group_id`,`shared_poll_id`);--> statement-breakpoint
CREATE INDEX `family_weekend_reflections_group_week_idx` ON `family_weekend_reflections` (`family_group_id`,`week_key`);--> statement-breakpoint
CREATE INDEX `family_weekly_care_themes_group_week_idx` ON `family_weekly_care_themes` (`family_group_id`,`week_key`);--> statement-breakpoint
CREATE INDEX `family_weekly_cheer_group_week_idx` ON `family_weekly_cheer_themes` (`family_group_id`,`week_key`);--> statement-breakpoint
CREATE INDEX `family_weekly_promises_group_week_idx` ON `family_weekly_promises` (`family_group_id`,`week_key`);--> statement-breakpoint
CREATE INDEX `family_wellbeing_notes_group_created_idx` ON `family_wellbeing_notes` (`family_group_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_wish_list_items_group_status_idx` ON `family_wish_list_items` (`family_group_id`,`status`);--> statement-breakpoint
CREATE INDEX `photo_journal_schedule_task_uid_idx` ON `photo_journal_schedules` (`schedule_cron_task_uid`);