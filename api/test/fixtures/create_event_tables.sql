DROP TABLE IF EXISTS `TEMPLATE_events`;

DROP TABLE IF EXISTS `TEMPLATE_event_values`;

DROP TABLE IF EXISTS `events_TESTING`;

DROP TABLE IF EXISTS `event_values_TESTING`;

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

CREATE TABLE IF NOT EXISTS events_TESTING LIKE TEMPLATE_events;

CREATE TABLE IF NOT EXISTS event_values_TESTING LIKE TEMPLATE_event_values;

TRUNCATE TABLE events_TESTING;

TRUNCATE TABLE event_values_TESTING;

INSERT INTO events_TESTING (`timestamp`,`uuid`,`ip`,`event`) VALUES
(1, 1, 1, 'event1'),
(2, 2, 3, 'event1'),
(3, 2, 4, 'event3'),
(4, 1, 2, 'event2'),
(5, 2, 4, 'event1'),
(6, 1, 5, 'event1'),
(7, 2, 3, 'event2'),
(8, 2, 3, 'event2'),
(9, 2, 3, 'event3'),
(10, 1, 5, 'event3');

INSERT INTO event_values_TESTING (`event_id`,`prop`,`value`) VALUES
(1, 'os', 'Mac OS X'),
(2, 'os', 'Mac OS X'),
(3, 'os', 'Mac OS X'),
(4, 'os', 'Mac OS X'),
(5, 'os', 'Mac OS X'),
(6, 'os', 'Mac OS X'),
(7, 'os', 'Mac OS X'),
(8, 'os', 'Mac OS X'),
(9, 'os', 'Mac OS X'),
(10, 'os', 'Mac OS X'),
(1, 'browser', 'Firefox'),
(2, 'browser', 'Chrome'),
(3, 'browser', 'Firefox'),
(4, 'browser', 'Firefox'),
(5, 'browser', 'Opera'),
(6, 'browser', 'IE6'),
(7, 'browser', 'Firefox'),
(8, 'browser', 'Chrome'),
(9, 'browser', 'Chrome'),
(10, 'browser', 'IE9'),
(1, 'cohort', '12'),
(2, 'cohort', '12'),
(3, 'cohort', '12'),
(4, 'cohort', '12'),
(5, 'cohort', '12'),
(6, 'cohort', '12'),
(7, 'cohort', '12'),
(8, 'cohort', '12'),
(9, 'cohort', '12'),
(10, 'cohort', '12');