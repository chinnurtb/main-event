var _ = require('underscore');

module.exports = function (DB_EVENT, ProjectModel) {

  DB_EVENT.query("SET time_zone='UTC';");

  const DEFAULT_STREAM_NUM = 100;
  const DEFAULT_PEOPLE_NUM = 40;
  const MAX_RESULTS_NUM = 500;

  // limit "latest" output to the last 7 days. if there is nothing in those 7 days then the project is pretty much dead
  const PAST_TIMESTAMP_LIMIT = 7 * 24 * 60 * 60;

  var StreamModel = {
    getLatestEvents:function(options, callback) {
      if (!options.project) {
        return callback({project:'required project ID'});
      }

      if (!options.limit) {
        options.limit = DEFAULT_STREAM_NUM;
      }
      else {
        // make sure limit is a positive integer with max value 500
        options.limit = Math.max(0, Math.min(MAX_RESULTS_NUM, parseInt(options.limit)));
      }

      // make sure project exists
      ProjectModel.getProjectInfo({project:options.project}, function (err, project) {
        if (err) {
          return callback(err);
        }

        var events_table = 'events_' + project.token;
        var values_table = 'event_values_' + project.token;

        var query = "SELECT e.event, e.uuid AS distinct_id, e.timestamp AS ts_epoch, DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(e.timestamp), 'UTC', ?), '%Y-%m-%d %H:%i:%s') AS ts, ev1.value as name_tag, ev2.value as note FROM " + events_table + ' e LEFT JOIN ' + values_table + " ev1 ON e.id=ev1.event_id AND ev1.prop='mp_name_tag' LEFT JOIN " + values_table + " ev2 ON e.id=ev2.event_id AND ev2.prop='mp_note' WHERE e.timestamp > UNIX_TIMESTAMP() - ? ORDER BY e.timestamp DESC LIMIT ?";

        DB_EVENT.query(query, [project.timezone, PAST_TIMESTAMP_LIMIT, options.limit], callback);
      });
    },
    getLatestPeople:function(options, callback) {
      if (!options.project) {
        return callback({project:'required project ID'});
      }

      if (!options.limit) {
        options.limit = DEFAULT_PEOPLE_NUM;
      }
      else {
        // make sure limit is a positive integer with max value 500
        options.limit = Math.max(0, Math.min(MAX_RESULTS_NUM, parseInt(options.limit)));
      }

      // make sure project exists
      ProjectModel.getProjectInfo({project:options.project}, function (err, project) {
        if (err) {
          return callback(err);
        }

        var events_table = 'events_' + project.token;
        var values_table = 'event_values_' + project.token;

        var query = "SELECT e.event, e.uuid AS distinct_id, e.timestamp AS ts_epoch, DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(e.timestamp), 'UTC', ?), '%Y-%m-%d %H:%i:%s') AS ts, ev1.value as name_tag, ev2.value as note FROM (SELECT DISTINCT uuid FROM " + events_table + ' ORDER BY timestamp DESC LIMIT ?) ppl JOIN ' + events_table + ' e ON ppl.uuid=e.uuid LEFT JOIN ' + values_table + " ev1 ON e.id=ev1.event_id AND ev1.prop='mp_name_tag' LEFT JOIN " + values_table + " ev2 ON e.id=ev2.event_id AND ev2.prop='mp_note' WHERE e.timestamp > UNIX_TIMESTAMP() - ? ORDER BY e.timestamp DESC";

        DB_EVENT.query(query, [project.timezone, options.limit, PAST_TIMESTAMP_LIMIT], function(err, res) {
          if (err) {
            return callback(err);
          }
          // here we can have an arbitrary number of records, but they will belong to options.limit people maximum
          var people = {};
          // build a dictionary of people by distinct_id, with all their events
          var person, pi;
          res.forEach(function(r) {
            pi = r.distinct_id;
            delete(r.distinct_id);
            if (!people[pi]) {
              people[pi] = person = {};
              person.name_tag = r.name_tag;
              person.distinct_id = pi;
              person.recent_history = [];
            }
            delete(r.name_tag);
            people[pi].recent_history.push(r);
          });

          var final_result = [];
          Object.keys(people).forEach(function(pi) {
            final_result.push(people[pi]);
          });

          callback(null, final_result);
        });
      });
    }
  };

  return StreamModel;
};