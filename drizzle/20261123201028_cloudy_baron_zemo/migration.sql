ALTER TABLE `api_keys` RENAME TO `_old_api_keys`;--> statement-breakpoint
ALTER TABLE `position_values` RENAME TO `_old_position_values`;--> statement-breakpoint
ALTER TABLE `positions` RENAME TO `_old_positions`;--> statement-breakpoint
ALTER TABLE `stances` RENAME TO `_old_stances`;--> statement-breakpoint
ALTER TABLE `topics` RENAME TO `_old_topics`;--> statement-breakpoint
ALTER TABLE `users` RENAME TO `_old_users`;--> statement-breakpoint
ALTER TABLE `values` RENAME TO `_old_values`;--> statement-breakpoint
DROP INDEX `api_keys_user_id_idx`;--> statement-breakpoint
DROP INDEX `position_values_position_id_value_id_unique`;--> statement-breakpoint
DROP INDEX `positions_user_id_topic_id_label_unique`;--> statement-breakpoint
DROP INDEX `stances_topic_id_order_idx`;--> statement-breakpoint
DROP INDEX `stances_topic_id_slug_unique`;--> statement-breakpoint
DROP INDEX `topics_subdomain_unique`;--> statement-breakpoint
DROP INDEX `users_did_idx`;--> statement-breakpoint
DROP INDEX `values_topic_id_order_idx`;--> statement-breakpoint
DROP INDEX `values_topic_id_slug_unique`;--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY,
	`did` text,
	`handle` text,
	`role` text DEFAULT 'BASIC' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`created_by` text,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	CONSTRAINT `fk_users_created_by_users_did_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`did`),
	CONSTRAINT `fk_users_updated_by_users_did_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`did`),
	CONSTRAINT `fk_users_deleted_by_users_did_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`did`)
);--> statement-breakpoint
CREATE UNIQUE INDEX `users_did_idx` ON `users` (`did`);--> statement-breakpoint
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
);--> statement-breakpoint
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
	CONSTRAINT `fk_stances_topic_id_topics_id_fk` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`),
	CONSTRAINT `fk_stances_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_stances_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_stances_deleted_by_users_id_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`)
);--> statement-breakpoint
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
	CONSTRAINT `fk_values_topic_id_topics_id_fk` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`),
	CONSTRAINT `fk_values_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_values_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_values_deleted_by_users_id_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`)
);--> statement-breakpoint
CREATE TABLE `positions` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`topic_id` text NOT NULL,
	`label` text NOT NULL,
	`overall_stance_id` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`created_by` text,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	CONSTRAINT `fk_positions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_positions_topic_id_topics_id_fk` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`),
	CONSTRAINT `fk_positions_overall_stance_id_stances_id_fk` FOREIGN KEY (`overall_stance_id`) REFERENCES `stances`(`id`),
	CONSTRAINT `fk_positions_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_positions_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_positions_deleted_by_users_id_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`)
);--> statement-breakpoint
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
);--> statement-breakpoint
CREATE TABLE `position_values` (
	`id` text PRIMARY KEY,
	`position_id` text NOT NULL,
	`value_id` text NOT NULL,
	`stance_id` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`created_by` text,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	CONSTRAINT `fk_position_values_position_id_positions_id_fk` FOREIGN KEY (`position_id`) REFERENCES `positions`(`id`),
	CONSTRAINT `fk_position_values_value_id_values_id_fk` FOREIGN KEY (`value_id`) REFERENCES `values`(`id`),
	CONSTRAINT `fk_position_values_stance_id_stances_id_fk` FOREIGN KEY (`stance_id`) REFERENCES `stances`(`id`),
	CONSTRAINT `fk_position_values_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_position_values_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_position_values_deleted_by_users_id_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`)
);--> statement-breakpoint
INSERT INTO `users`(`id`, `did`, `handle`, `role`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) SELECT `id`, `did`, `handle`, `role`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by` FROM `_old_users`;--> statement-breakpoint
INSERT INTO `topics`(`id`, `subdomain`, `title`, `atp_uri`, `atp_cid`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) SELECT `id`, `subdomain`, `title`, `atp_uri`, `atp_cid`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by` FROM `_old_topics`;--> statement-breakpoint
INSERT INTO `stances`(`id`, `topic_id`, `slug`, `label`, `icon`, `color`, `description`, `example`, `character_name`, `character_tagline`, `character_bio`, `order`, `atp_uri`, `atp_cid`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) SELECT `id`, `topic_id`, `slug`, `label`, `icon`, `color`, `description`, `example`, `character_name`, `character_tagline`, `character_bio`, `order`, `atp_uri`, `atp_cid`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by` FROM `_old_stances`;--> statement-breakpoint
INSERT INTO `values`(`id`, `topic_id`, `slug`, `label`, `description`, `order`, `atp_uri`, `atp_cid`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) SELECT `id`, `topic_id`, `slug`, `label`, `description`, `order`, `atp_uri`, `atp_cid`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by` FROM `_old_values`;--> statement-breakpoint
INSERT INTO `positions`(`id`, `user_id`, `topic_id`, `label`, `overall_stance_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) SELECT `id`, `user_id`, `topic_id`, `label`, `overall_stance_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by` FROM `_old_positions`;--> statement-breakpoint
INSERT INTO `api_keys`(`id`, `user_id`, `name`, `permissions`, `revoke_at`, `api_key`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) SELECT `id`, `user_id`, `name`, `permissions`, `revoke_at`, `api_key`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by` FROM `_old_api_keys`;--> statement-breakpoint
INSERT INTO `position_values`(`id`, `position_id`, `value_id`, `stance_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) SELECT `id`, `position_id`, `value_id`, `stance_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by` FROM `_old_position_values`;--> statement-breakpoint
DROP TABLE `_old_position_values`;--> statement-breakpoint
DROP TABLE `_old_positions`;--> statement-breakpoint
DROP TABLE `_old_api_keys`;--> statement-breakpoint
DROP TABLE `_old_stances`;--> statement-breakpoint
DROP TABLE `_old_values`;--> statement-breakpoint
DROP TABLE `_old_topics`;--> statement-breakpoint
DROP TABLE `_old_users`;--> statement-breakpoint
CREATE INDEX `api_keys_user_id_idx` ON `api_keys` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `position_values_position_id_value_id_unique` ON `position_values` (`position_id`,`value_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `positions_user_id_topic_id_label_unique` ON `positions` (`user_id`,`topic_id`,`label`);--> statement-breakpoint
CREATE UNIQUE INDEX `stances_topic_id_slug_unique` ON `stances` (`topic_id`,`slug`);--> statement-breakpoint
CREATE INDEX `stances_topic_id_order_idx` ON `stances` (`topic_id`,`order`);--> statement-breakpoint
CREATE UNIQUE INDEX `topics_subdomain_unique` ON `topics` (`subdomain`);--> statement-breakpoint
CREATE UNIQUE INDEX `values_topic_id_slug_unique` ON `values` (`topic_id`,`slug`);--> statement-breakpoint
CREATE INDEX `values_topic_id_order_idx` ON `values` (`topic_id`,`order`);
