CREATE TABLE `projects_funnels` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` INT(10) UNSIGNED NOT NULL,
  `name` VARCHAR(25) NOT NULL DEFAULT 'no name',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `funnel_events` (
  `funnel_id` INT(10) UNSIGNED NOT NULL,
  `ord` INT(10) UNSIGNED NOT NULL,
  `event` VARCHAR(25) NOT NULL,
  PRIMARY KEY `funnel_ord` (`funnel_id`,`ord`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
