CREATE TABLE `accounts` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`resource_type` text NOT NULL,
	`resource_id` text NOT NULL,
	`details` text,
	`ip_address` text,
	`user_agent` text,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `analytics` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`video_id` text,
	`channel_id` text,
	`date` text NOT NULL,
	`views` integer DEFAULT 0,
	`likes` integer DEFAULT 0,
	`comments` integer DEFAULT 0,
	`shares` integer DEFAULT 0,
	`watch_time_minutes` integer DEFAULT 0,
	`subscribers` integer DEFAULT 0,
	`revenue` integer DEFAULT 0,
	`engagement_rate` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `channels` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`channel_id` text NOT NULL,
	`channel_name` text NOT NULL,
	`description` text,
	`thumbnail_url` text,
	`subscriber_count` integer,
	`video_count` integer,
	`access_token` text,
	`refresh_token` text,
	`expires_at` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `channels_channel_id_unique` ON `channels` (`channel_id`);--> statement-breakpoint
CREATE TABLE `download_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`source_url` text NOT NULL,
	`source_type` text NOT NULL,
	`output_path` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`progress` integer DEFAULT 0,
	`file_size` integer,
	`downloaded_size` integer,
	`metadata` text,
	`error_message` text,
	`queue_job_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`queue_job_id`) REFERENCES `upload_jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`type` text DEFAULT 'info' NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `queue_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text,
	`level` text NOT NULL,
	`message` text NOT NULL,
	`data` text,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `upload_jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'editor' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `upload_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`video_id` text,
	`queue_name` text NOT NULL,
	`job_id` text,
	`status` text DEFAULT 'waiting' NOT NULL,
	`progress` integer DEFAULT 0,
	`data` text,
	`result` text,
	`error` text,
	`attempts` integer DEFAULT 0,
	`max_attempts` integer DEFAULT 3,
	`priority` integer DEFAULT 0,
	`delay_until` integer,
	`processed_at` integer,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `upload_jobs_job_id_unique` ON `upload_jobs` (`job_id`);--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`language` text DEFAULT 'en' NOT NULL,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`notifications` text NOT NULL,
	`upload_settings` text NOT NULL,
	`schedule_settings` text NOT NULL,
	`api_settings` text NOT NULL,
	`selected_channel_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`selected_channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`emailVerified` integer,
	`image` text,
	`plan` text DEFAULT 'alpha' NOT NULL,
	`stripeCustomerId` text,
	`subscriptionId` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
CREATE TABLE `video_schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`video_id` text NOT NULL,
	`scheduled_at` integer NOT NULL,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`is_recurring` integer DEFAULT false NOT NULL,
	`recurrence_pattern` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`channel_id` text,
	`title` text NOT NULL,
	`description` text,
	`tags` text,
	`category_id` text,
	`language` text,
	`privacy` text DEFAULT 'private' NOT NULL,
	`license` text DEFAULT 'youtube',
	`location` text,
	`recording_date` text,
	`file_path` text,
	`file_size` integer,
	`duration` integer,
	`thumbnail_path` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`youtube_video_id` text,
	`publish_at` integer,
	`scheduled_at` integer,
	`uploaded_at` integer,
	`published_at` integer,
	`retry_count` integer DEFAULT 0,
	`error_message` text,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE cascade
);
