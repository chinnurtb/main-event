<?php
/**
 * Created by JetBrains PhpStorm.
 * User: jmagnuss
 * Date: 12-06-09
 * Time: 7:03 AM
 * To change this template use File | Settings | File Templates.
 */

date_default_timezone_set('Canada/Pacific'); // entrely to get rid of annoying php warning
$dbevent = null;
$dbapi = null;
db_connect();

$project_list = fetch_projects();
foreach ($project_list as $project) {
   update_summary($project);
}

/*
$project = array(
   'token' => '7dc9086f9b506bbc0492447f1',
   'name' => 'test proj',
   'timezone' => 'Canada/Pacific'
);
update_summary($project);
*/
echo "Done.\n";

function update_summary($project) {
   global $dbapi, $dbevent;
   $proj_db = 'project_'.$project['token'];
   $tz = $project['timezone'];
   echo 'Project '.$project['name'].' using tz '.$tz.': '.$proj_db."\n";
   /*
    * Find last entered time
    */
   $last_done_timestamp = 0;
   $res = $dbevent->query(sprintf('select max(end_timestamp) from %s.event_summary where tz="%s"', $proj_db, $tz));
   if (!$res) {
      echo 'Error: '. $dbevent->error . "\n";
      return;
   }
   if ($row = $res->fetch_array()) {
      $last_done_timestamp = $row[0];
   }
   $res->close();
   printf("update_summary(%s): last done timestamp is %u\n", $project['name'], $last_done_timestamp);
   /*
    * Find first event entry AFTER the last_done time, so we have a starting bound to our work
    * Important to note here that we are doing >=, not >.  We re-check (and eventually re-process) the last_done
    * time, because it could have been a partial period.  This way we can run this always, and the period that
    * last_done IS IN will always get re-processed.
    * This also lets us be restartable - this script can be killed and restarted and we won't have broken periods
    */
   $first_new_timestamp = 0;
   $res = $dbevent->query(sprintf('select min(timestamp) from %s.event_log where timestamp >= %u', $proj_db, $last_done_timestamp));
   if (!$res) {
      echo 'Error: '. $dbevent->error . "\n";
      return;
   }
   if ($row = $res->fetch_array()) {
      $first_new_timestamp = $row[0];
   }
   $res->close();
   printf("update_summary(%s): first new timestamp is %u\n", $project['name'], $first_new_timestamp);
   if ($first_new_timestamp < 1) {
      printf("update_summary(%s): up to date, no new records to run.\n", $project['name']);
      return;
   }
   /*
    * What we're going to do is to split the time range between first_new and now into date and hour chunks.
    * Eg. if first_new is 2012-05-01 12:20:00, and now is 2012-05-03 08:05:00 we will process these chunks:
    * 2012-05-01 12: to
    * 2012-05-01 23:
    * 2012-05-02 00: to
    * 2012-05-02 23:
    * 2012-05-03 00: to
    * 2012-05-03 08
    * They are done in one-hour blocks.  These blocks are in project-timezone, for reporting with.
    * The event_log timestamps are all in UTC, when we process each block, we will calculate the UTC start and end
    * timestamps for the block, and select from event_log based on those.
    */
   $php_tz = new DateTimeZone($tz);
   $start_dt = new DateTime;
   $start_dt->setTimestamp($first_new_timestamp);
   $start_dt->setTimezone($php_tz);
   $end_dt = new DateTime("now + 1 hours", $php_tz);
   /*
   // For verification
   $start_y = $start_dt->format('Y');
   $start_m = $start_dt->format('m');
   $start_d = $start_dt->format('d');
   $start_h = $start_dt->format('H');
   printf("update_summary(%s): starting from %d %d %d %d\n", $project['name'], $start_y,$start_m,$start_d,$start_h);
   $end_y = $end_dt->format('Y');
   $end_m = $end_dt->format('m');
   $end_d = $end_dt->format('d');
   $end_h = $end_dt->format('H');
   printf("update_summary(%s): ending at %d %d %d %d\n", $project['name'], $end_y,$end_m,$end_d,$end_h);
   */
   $interval = DateInterval::createFromDateString('1 hour');
   $period = new DatePeriod($start_dt, $interval, $end_dt);
   foreach ( $period as $dt ) {
      summarize_chunk($project, $dt);
   }
}

function summarize_chunk($project, $chunk_dt) {
   global $dbapi, $dbevent;
   printf("summarize_chunk(%s): %s\n", $project['name'], $chunk_dt->format("Y-m-d H:00"));
   /*
    * The goal here is to find the start and end timestamps for this chunk, and summarize the event_log entries in that
    * range, making inserts into the event_summary table.
    */
   $start_dt = new DateTime($chunk_dt->format('r'));
   $end_dt = new DateTime($chunk_dt->format('r'));
   $hour = $chunk_dt->format('H');
   $start_dt->setTime($hour, 0, 0);
   $end_dt->setTime($hour, 59, 59);
   printf("summarize_chunk(%s) start %u (%s)\n", $project['name'], $start_dt->getTimestamp(), $start_dt->format('r'));
   printf("summarize_chunk(%s) end %u (%s)\n", $project['name'], $end_dt->getTimestamp(), $end_dt->format('r'));
   /*
    * Fetch the data for this time chunk
    */
   $proj_db = 'project_'.$project['token'];
   $sql = sprintf('select event_name_id,count(*) from %s.event_log where timestamp between %u and %u group by event_name_id',
      $proj_db, $start_dt->getTimestamp(), $end_dt->getTimestamp());
   echo $sql."\n";
   $res = $dbevent->query($sql);
   if (!$res) {
      echo 'Error: '. $dbevent->error . "\n";
      return;
   }
   // We do a replace instead of insert because we have a unique index on (tz,date,hour,event_name_id), and we might
   // be regenerating stats.
   $have_data = false;
   $ins_sql = sprintf('replace into %s.event_summary (tz,date,hour,end_timestamp,event_name_id,num) values ', $proj_db);
   while ($row = $res->fetch_array()) {
      //var_dump($row);
      $ins_sql .= sprintf("('%s','%s',%d,%u,%d,%d), ",
         $project['timezone'],
         $chunk_dt->format('Y-m-d'),
         $hour,
         $end_dt->getTimestamp(),
         $row['event_name_id'],
         $row[1]);
      $have_data = true;
   }
   $res->close();
   if ($have_data) {
      // strip trailing comma
      $ins_sql = trim($ins_sql, ', ');
      echo 'sql: '.$ins_sql."\n";
      if (!$dbevent->query($ins_sql)) {
         echo 'Error: '. $dbevent->error . "\n";
         return;
      }
   }
}

function fetch_projects() {
   // select * from projects
   // return array of tokens
   global $dbapi, $dbevent;
   $res = $dbapi->query("select * from projects where !isnull(token)");
   if (!$res) {
      echo 'Error: '. $dbapi->error . "\n";
      return;
   }
   $proj_list = array();
   while ($row = $res->fetch_assoc()) {
      array_push($proj_list, $row);
   }
   $res->close();
   return $proj_list;
}


function db_connect() {
   /*
  "mysql":{
    "host":"127.0.0.1",
    "port":3306,
    "user":"root",
    "password":"",
    "database":"event"
  },
  "mysql_api":{
    "host":"127.0.0.1",
    "port":3306,
    "user":"root",
    "password":"",
    "database":"event_api"
  },
   */
   /*
   $conf_file = 'config/' . (($_ENV['NODE_ENV']) ? $_ENV['NODE_ENV'] : 'production') .'.js';
   $dbjson = file_get_contents($conf_file);
   $dbconfig = json_decode($dbjson, true);
   var_dump($dbconfig);
   */

   global $dbevent, $dbapi;
   $dbevent = new mysqli('localhost','root','');
   if ($dbevent->connect_errno) {
      echo "Failed to connect to MySQL: (" . $dbevent->connect_errno . ") " . $dbevent->connect_error;
      exit();
   }
   echo $dbevent->host_info . "\n";

   $dbapi = new mysqli('localhost','root','','event_api');
   if ($dbapi->connect_errno) {
      echo "Failed to connect to MySQL: (" . $dbapi->connect_errno . ") " . $dbapi->connect_error;
      exit();
   }
   echo $dbapi->host_info . "\n";
}


