CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`doctor_id` int NOT NULL,
	`date` varchar(50) NOT NULL,
	`time` varchar(50) NOT NULL,
	`type` varchar(100) NOT NULL,
	`status` varchar(100) NOT NULL DEFAULT 'pending',
	`reason` text,
	`cancellation_reason` text,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doctors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`specialty` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	CONSTRAINT `doctors_id` PRIMARY KEY(`id`),
	CONSTRAINT `doctors_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `notification_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`email_enabled` boolean DEFAULT true,
	`sms_enabled` boolean DEFAULT false,
	`push_enabled` boolean DEFAULT true,
	CONSTRAINT `notification_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`date_of_birth` varchar(50) DEFAULT NULL,
	`address` text,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`),
	CONSTRAINT `patients_email_unique` UNIQUE(`email`)
);
