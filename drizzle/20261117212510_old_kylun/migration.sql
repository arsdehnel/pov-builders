CREATE TABLE `position_values` (
	`id` text PRIMARY KEY,
	`position_id` text NOT NULL,
	`value_id` text NOT NULL,
	`stance_id` text NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
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
);
--> statement-breakpoint
CREATE UNIQUE INDEX `position_values_position_id_value_id_unique` ON `position_values` (`position_id`,`value_id`);