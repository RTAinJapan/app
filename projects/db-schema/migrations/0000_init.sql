CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`discord_id` text,
	`display_name` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_discord_id_unique` ON `users` (`discord_id`);