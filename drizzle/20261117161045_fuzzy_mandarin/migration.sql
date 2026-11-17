CREATE TABLE `positions` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`topic_id` text NOT NULL,
	`label` text NOT NULL,
	`overall_stance_id` text NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
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
);
--> statement-breakpoint
CREATE UNIQUE INDEX `positions_user_id_topic_id_label_unique` ON `positions` (`user_id`,`topic_id`,`label`);