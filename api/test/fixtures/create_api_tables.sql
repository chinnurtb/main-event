DROP TABLE IF EXISTS `api_applications`;

DROP TABLE IF EXISTS `applications_projects`;

DROP TABLE IF EXISTS `projects`;

CREATE TABLE IF NOT EXISTS `api_applications` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `app_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_name` (`app_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `applications_projects` (
  `app_id` int(10) unsigned NOT NULL,
  `project_id` int(10) unsigned NOT NULL,
  UNIQUE KEY `unique_app_proj` (`app_id`,`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `projects` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `timezone` varchar(50) NOT NULL DEFAULT 'US/Eastern',
  `token` varchar(25) UNIQUE NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_project_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `projects` ADD COLUMN `api_key` VARCHAR(40) UNIQUE, ADD COLUMN `api_secret` VARCHAR(40) UNIQUE;

TRUNCATE TABLE `api_applications`;

TRUNCATE TABLE `projects`;

TRUNCATE TABLE `applications_projects`;

INSERT INTO `api_applications` SET `app_name`='testing_app';

INSERT INTO `projects` SET `name`='TESTING', `timezone`='UTC', `token`='TESTING', api_key='xxx', api_secret='zzz';

INSERT INTO `applications_projects` SET `app_id`=1, `project_id`=1;
