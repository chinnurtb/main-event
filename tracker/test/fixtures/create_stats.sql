CREATE TABLE IF NOT EXISTS `TEMPLATE_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `timestamp` int unsigned NOT NULL,
  `uuid` varchar(50) NOT NULL,
  `ip` int unsigned NOT NULL,
  `event` varchar(25) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `event` (`event`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `TEMPLATE_event_values` (
  `event_id` bigint NOT NULL,
  `prop` varchar(25) NOT NULL,
  `value` varchar(200) NOT NULL,
  PRIMARY KEY (`prop`,`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
PARTITION BY KEY(`prop`)
PARTITIONS 25;

CREATE TABLE IF NOT EXISTS `events_TESTING` LIKE `TEMPLATE_events`;

CREATE TABLE IF NOT EXISTS `event_values_TESTING` LIKE `TEMPLATE_event_values`;