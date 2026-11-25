CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`permissions` text DEFAULT '[]' NOT NULL,
	`revoke_at` text NOT NULL,
	`api_key` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
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
	`icon` text NOT NULL,
	`color` text NOT NULL,
	`description` text NOT NULL,
	`example` text NOT NULL,
	`character_name` text NOT NULL,
	`character_tagline` text NOT NULL,
	`character_bio` text NOT NULL,
	`order` integer NOT NULL,
	`atp_uri` text,
	`atp_cid` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`created_by` text,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	CONSTRAINT `fk_stances_topic_id_topics_id_fk` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_stances_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_stances_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_stances_deleted_by_users_id_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` text PRIMARY KEY,
	`subdomain` text NOT NULL,
	`title` text NOT NULL,
	`atp_uri` text,
	`atp_cid` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
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
	`did` text NOT NULL,
	`handle` text,
	`role` text DEFAULT 'BASIC' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`created_by` text,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	CONSTRAINT `fk_users_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_users_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_users_deleted_by_users_id_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `values` (
	`id` text PRIMARY KEY,
	`topic_id` text NOT NULL,
	`slug` text NOT NULL,
	`label` text NOT NULL,
	`description` text NOT NULL,
	`order` integer NOT NULL,
	`atp_uri` text,
	`atp_cid` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`created_by` text,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	CONSTRAINT `fk_values_topic_id_topics_id_fk` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_values_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_values_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_values_deleted_by_users_id_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `view_values` (
	`id` text PRIMARY KEY,
	`view_id` text NOT NULL,
	`value_id` text NOT NULL,
	`stance_id` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`created_by` text,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	CONSTRAINT `fk_view_values_view_id_views_id_fk` FOREIGN KEY (`view_id`) REFERENCES `views`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_view_values_value_id_values_id_fk` FOREIGN KEY (`value_id`) REFERENCES `values`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_view_values_stance_id_stances_id_fk` FOREIGN KEY (`stance_id`) REFERENCES `stances`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_view_values_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_view_values_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_view_values_deleted_by_users_id_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `views` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`topic_id` text NOT NULL,
	`label` text NOT NULL,
	`overall_stance_id` text NOT NULL,
	`atp_uri` text,
	`atp_cid` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`created_by` text,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	CONSTRAINT `fk_views_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_views_topic_id_topics_id_fk` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_views_overall_stance_id_stances_id_fk` FOREIGN KEY (`overall_stance_id`) REFERENCES `stances`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_views_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_views_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_views_deleted_by_users_id_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE INDEX `api_keys_user_id_idx` ON `api_keys` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `stances_topic_id_slug_unique` ON `stances` (`topic_id`,`slug`);--> statement-breakpoint
CREATE INDEX `stances_topic_id_order_idx` ON `stances` (`topic_id`,`order`);--> statement-breakpoint
CREATE UNIQUE INDEX `topics_subdomain_unique` ON `topics` (`subdomain`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_did_idx` ON `users` (`did`);--> statement-breakpoint
CREATE UNIQUE INDEX `values_topic_id_slug_unique` ON `values` (`topic_id`,`slug`);--> statement-breakpoint
CREATE INDEX `values_topic_id_order_idx` ON `values` (`topic_id`,`order`);--> statement-breakpoint
CREATE UNIQUE INDEX `view_values_view_id_value_id_unique` ON `view_values` (`view_id`,`value_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `views_user_id_topic_id_label_unique` ON `views` (`user_id`,`topic_id`,`label`);