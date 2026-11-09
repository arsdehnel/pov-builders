CREATE TABLE `topics` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`subdomain` text NOT NULL,
	`title` text NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	CONSTRAINT `fk_topics_created_by_users_did_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`did`),
	CONSTRAINT `fk_topics_updated_by_users_did_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`did`),
	CONSTRAINT `fk_topics_deleted_by_users_did_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`did`)
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
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`topic_id` text NOT NULL,
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
	CONSTRAINT `fk_values_created_by_users_did_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`did`),
	CONSTRAINT `fk_values_updated_by_users_did_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`did`),
	CONSTRAINT `fk_values_deleted_by_users_did_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`did`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `topics_subdomain_unique` ON `topics` (`subdomain`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_did_idx` ON `users` (`did`);--> statement-breakpoint
CREATE UNIQUE INDEX `values_order_unique` ON `values` (`order`);