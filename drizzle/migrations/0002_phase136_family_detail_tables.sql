CREATE TABLE IF NOT EXISTS notification_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  family_group_id INT NOT NULL,
  member_role ENUM('guardian','child','elderly') NOT NULL DEFAULT 'guardian',
  vibration_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sound_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  banner_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  quiet_mode BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX notification_settings_user_family_idx (user_id, family_group_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  family_group_id INT NOT NULL,
  type VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  payload JSON NULL,
  quiet BOOLEAN NOT NULL DEFAULT TRUE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX notifications_user_family_read_idx (user_id, family_group_id, read_at),
  INDEX notifications_user_family_created_idx (user_id, family_group_id, created_at)
);

CREATE TABLE IF NOT EXISTS family_schedule_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  family_group_id INT NOT NULL,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX family_schedule_events_group_start_idx (family_group_id, start_time)
);

CREATE TABLE IF NOT EXISTS family_sharing_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  family_group_id INT NOT NULL,
  user_id INT NOT NULL,
  share_location BOOLEAN NOT NULL DEFAULT TRUE,
  share_health BOOLEAN NOT NULL DEFAULT TRUE,
  share_check_in BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX family_sharing_preferences_group_user_idx (family_group_id, user_id)
);

CREATE TABLE IF NOT EXISTS family_check_in_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  family_group_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('okay','rest','available') NOT NULL,
  is_shared BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX family_check_in_records_group_user_created_idx (family_group_id, user_id, created_at)
);

CREATE TABLE IF NOT EXISTS wearable_health_snapshots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  family_group_id INT NOT NULL,
  user_id INT NOT NULL,
  steps INT NOT NULL,
  heart_rate INT NOT NULL,
  sleep_minutes INT NOT NULL,
  source ENUM('simulated') NOT NULL DEFAULT 'simulated',
  simulated_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX wearable_health_snapshots_group_user_simulated_idx (family_group_id, user_id, simulated_at)
);

CREATE TABLE IF NOT EXISTS family_help_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  family_group_id INT NOT NULL,
  requester_user_id INT NOT NULL,
  helper_user_id INT NULL,
  title VARCHAR(160) NOT NULL,
  detail TEXT NULL,
  status ENUM('open','accepted','completed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX family_help_requests_group_status_idx (family_group_id, status)
);

CREATE TABLE IF NOT EXISTS family_shopping_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  family_group_id INT NOT NULL,
  created_by_user_id INT NOT NULL,
  purchased_by_user_id INT NULL,
  item_name VARCHAR(160) NOT NULL,
  quantity VARCHAR(80) NULL,
  is_purchased BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX family_shopping_items_group_purchased_idx (family_group_id, is_purchased)
);
