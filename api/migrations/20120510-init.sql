CREATE TABLE `api_applications` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `app_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_name` (`app_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `applications_projects` (
  `app_id` int(10) unsigned NOT NULL,
  `project_id` int(10) unsigned NOT NULL,
  UNIQUE KEY `unique_app_proj` (`app_id`,`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `projects` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `timezone` varchar(50) NOT NULL DEFAULT 'US/Eastern',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_project_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;