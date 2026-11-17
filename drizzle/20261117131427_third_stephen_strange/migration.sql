CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`permissions` text DEFAULT '[]' NOT NULL,
	`revoke_at` text NOT NULL,
	`api_key` text NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	CONSTRAINT `fk_api_keys_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_api_keys_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_api_keys_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_api_keys_deleted_by_users_id_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `stances` (
	`id` text PRIMARY KEY,
	`topic_id` text NOT NULL,
	`slug` text NOT NULL,
	`label` text NOT NULL,
	`color` text NOT NULL,
	`description` text NOT NULL,
	`example` text NOT NULL,
	`character_name` text NOT NULL,
	`character_tagline` text NOT NULL,
	`character_bio` text NOT NULL,
	`order` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	CONSTRAINT `fk_stances_topic_id_topics_id_fk` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`),
	CONSTRAINT `fk_stances_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_stances_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_stances_deleted_by_users_id_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` text PRIMARY KEY,
	`subdomain` text NOT NULL,
	`title` text NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	CONSTRAINT `fk_topics_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_topics_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_topics_deleted_by_users_id_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY,
	`did` text,
	`handle` text,
	`role` text DEFAULT 'BASIC' NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	CONSTRAINT `fk_users_created_by_users_did_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`did`),
	CONSTRAINT `fk_users_updated_by_users_did_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`did`),
	CONSTRAINT `fk_users_deleted_by_users_did_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`did`)
);
--> statement-breakpoint
CREATE TABLE `values` (
	`id` text PRIMARY KEY,
	`topic_id` text NOT NULL,
	`slug` text NOT NULL,
	`label` text NOT NULL,
	`description` text NOT NULL,
	`order` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	CONSTRAINT `fk_values_topic_id_topics_id_fk` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`),
	CONSTRAINT `fk_values_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_values_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_values_deleted_by_users_id_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE INDEX `api_keys_user_id_idx` ON `api_keys` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `stances_topic_id_slug_unique` ON `stances` (`topic_id`,`slug`);--> statement-breakpoint
CREATE INDEX `stances_topic_id_order_idx` ON `stances` (`topic_id`,`order`);--> statement-breakpoint
CREATE UNIQUE INDEX `topics_subdomain_unique` ON `topics` (`subdomain`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_did_idx` ON `users` (`did`);--> statement-breakpoint
CREATE UNIQUE INDEX `values_topic_id_slug_unique` ON `values` (`topic_id`,`slug`);--> statement-breakpoint
CREATE INDEX `values_topic_id_order_idx` ON `values` (`topic_id`,`order`);