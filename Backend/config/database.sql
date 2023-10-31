/*
SQLyog Community
MySQL - 5.7.33 
*********************************************************************
*/
/*!40101 SET NAMES utf8 */;

create table `users` (
	`username` VARCHAR (255) NOT NULL,
	`password` VARCHAR (2295) NOT NULL,
	`fname` VARCHAR (255) NOT NULL,
	`lname` VARCHAR (255) NOT NULL,
	`auth_status` BOOLEAN (1) DEFAULT 1,
	`status_lock` BOOLEAN (1) DEFAULT 0,
	`created_by` VARCHAR (2295),
	`created_date` datetime DEFAULT CURRENT_TIMESTAMP() ,
	`user_role` enum('admin','user') NOT NULL DEFAULT 'user',
	PRIMARY KEY(`username`)
); 