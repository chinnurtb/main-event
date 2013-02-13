var _ = require('underscore');
var time = require('time');

var DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

module.exports = function(DB, ProjectModel) {

  var date_map = {
    'date.date':'%Y-%m-%d',
    'date.week':'%x/Week %v',
    'date.day':'%W',
    'date.month':'%M %Y',
    'date.hour':'%Y-%m-%d %H'
  };

  var valid_filter_ops = ['=', 'in', '>','>=','<','<=','null','notnull'];

  DB.query("SET time_zone='UTC';");

  return {
    getSummary:function (options, callback) {
      console.log('event::getSummary');
      if (!options.project) {
        return callback({project: 'required'});
      }
      ProjectModel.getProjectInfo({project: options.project}, function(err, project) {
        if (err) {
          return callback(err);
        }
        var msInOneDay = 60*60*24 * 1000;
        var msInSevenDays = msInOneDay * 7;
        var msInThirtyDays = msInOneDay * 30;
          
        var dt_now = new time.Date();
        dt_now.setTimezone(project.timezone);
        console.log('getSummary: now='+dt_now.toString());
          
        var dt_todayStart = new time.Date(dt_now.toString());
        dt_todayStart.setHours(0, 0, 0);
        console.log('getSummary: todayStart='+dt_todayStart.toString());

        var dt_yesterday = new time.Date(dt_todayStart.getTime()-msInOneDay, project.timezone);
        console.log('getSummary: yesterday='+dt_yesterday.toString());

        var weekStart_ts = dt_todayStart.getTime();
        weekStart_ts -= (dt_todayStart.getDay() * msInOneDay);
        var dt_weekStart = new time.Date(weekStart_ts, project.timezone);
        console.log('getSummary: weekStart='+dt_weekStart.toString());

        var dt_lastWeek = new time.Date(dt_weekStart.getTime()-msInSevenDays, project.timezone);
        console.log('getSummary: lastWeek='+dt_lastWeek.toString());

        // last seven days is set to todayStart's unix_ts minus the right # of seconds, but in the correct tz.
        var lastSeven_ts = dt_todayStart.getTime() - (msInOneDay * 6); // use six so we include today
        var dt_lastSeven = new time.Date(lastSeven_ts, project.timezone);
        console.log('getSummary: lastSeven='+dt_lastSeven.toString());

        // similar math for last thirty
        var lastThirty_ts = dt_todayStart.getTime() - (msInOneDay * 29); // so we include today
        var dt_lastThirty = new time.Date(lastThirty_ts, project.timezone);
        console.log('getSummary: lastThirty='+dt_lastThirty.toString());

        var dt_thisMonth = new time.Date(dt_todayStart.toString());
        dt_thisMonth.setDate(1);
        console.log('getSummary: thisMonth='+dt_thisMonth.toString());

        var timestamps = {
            today:      [dt_todayStart.getTime(),   dt_todayStart.getTime() + msInOneDay],
            yesterday:  [dt_yesterday.getTime(),   dt_yesterday.getTime() + msInOneDay],
            this_week:  [dt_weekStart.getTime(),    dt_weekStart.getTime()  + msInSevenDays],
            last_week:  [dt_lastWeek.getTime(),     dt_lastWeek.getTime()   + msInSevenDays],
            last_7:     [dt_lastSeven.getTime(),    dt_lastSeven.getTime()  + msInSevenDays],
            last_30:    [dt_lastThirty.getTime(),   dt_lastThirty.getTime() + msInThirtyDays],
            mtd:        [dt_thisMonth.getTime(),    dt_thisMonth.getTime()  + msInThirtyDays]
        };

        var query = "select en.event,";
        Object.keys(timestamps).forEach(function (ts_key) {
          var start_ts = Math.floor(timestamps[ts_key][0] / 1000);
          var end_ts   = Math.floor(timestamps[ts_key][1] / 1000);
          var sql_part = "sum(if(ev.end_timestamp-60 between "+start_ts+" and "+end_ts+",num,0)) as "+ts_key+",";
          query += sql_part;
        });

        // special case for itd (take all values)
        var db = 'project_'+project.token;
        query += "\n  sum(num) AS itd\nFROM "+db+".event_summary ev,"+db+".event_name en where ev.event_name_id=en.id";

        if (options.event_name) {
          query += DB.format("\n and en.event = ?", [options.event_name]);
        }
        query += "\nGROUP BY en.event;";

        console.log('sql: '+query);

        DB.query(query, function (err, res) {
          if (err) {
            console.log('err: '+err);
            callback(err);
          }
          else if (res.length < 1 && options.event_name) {
            callback({event: 'Event ' + options.event_name + ' not found'});
          }
          /*else if (res.length == 1) {
            callback(null, res[0]);
          }*/
          else {
            var final_result = {}, event_name;
            res.forEach(function (r) {
              event_name = r.event;
              final_result[event_name] = r;
            });
            callback(null, final_result);
          }
        });
      });
    },
    
    getStats:function(options, callback) {
      if (!options.project) {
        return callback({project: 'required'});
      }
      ProjectModel.getProjectInfo({project:options.project}, function (err, project) {
        if (err) {
          return callback(err);
        }

        var project_db = 'project_' + project.token;

        var main_table = 'events_' + project.token;
        var values_table = 'event_values_' + project.token;
  
  //      options.spec = {
  //        'filters' : {
  //          'date' : ['yyyy-mm-dd','yyyy-mm-dd']
  //          'events' : ['event1', 'event2', ...],
  //          'custom' : [{field: 'field', op:[=,>,<,...], values:['value1','value2',...]}, ...]
  //        },
  //        'groups' : ['field1', 'field2', ...],
  //        'compact' : true, false
  //      };
  
        var custom_field_joins = {};
        var addCustomFieldJoin = function (custom_field) {
          if (custom_field_joins[custom_field]) {
            return custom_field_joins[custom_field];
          }
  
          var next_id = _.size(custom_field_joins) + 1;
          custom_field_joins[custom_field] = next_id;
  
          var kv_alias = 'kv_' + next_id;
          join_parts.push('LEFT JOIN ' + values_table + ' ' + kv_alias + ' ON (ee.id = ' + kv_alias + '.event_id AND ' + kv_alias + '.prop = ' + DB.format('?)', [custom_field]));
  
          return next_id;
        };
  
        var error;
        var spec = options.spec;
        if (!_.isObject(spec)) {
          return callback({spec: 'expecting object'});
        }

        if (spec.filters) {
          if (!_.isObject(spec.filters)) {
            return callback({spec:{filters:'expecting object'}});
          }

          if (spec.filters.date
              && !(_.isArray(spec.filters.date)
              && spec.filters.date.length == 2
              && spec.filters.date.every(function(d) {return d.match(DATE_REGEX);}))) {
            return callback({spec:{filters:{date:'expecting array with 2 values, start_date and end_date in yyyy-mm-dd format'}}});
          }

          if (spec.filters.custom) {
            if (!_.isArray(spec.filters.custom)) {
              return callback({spec:{filters:{custom:'expecting array of custom filters'}}});
            }

            error = null;
            spec.filters.custom.every(function(cf, i) {
              if (!_.isObject(cf)) {
                error = {spec:{filters:{custom:{}}}};
                error.spec.filters.custom[i] = 'expecting object';
                return false;
              }

              if (!(_.isString(cf.field) && cf.field.length > 0)) {
                error = {spec:{filters:{custom:{}}}};
                error.spec.filters.custom[i] = {field : 'expecting non-empty string'};
                return false;
              }

              if (!(_.isString(cf.op) && valid_filter_ops.indexOf(cf.op) >= 0)) {
                error = {spec:{filters:{custom:{}}}};
                error.spec.filters.custom[i] = {op : 'expecting value from ' + JSON.stringify(valid_filter_ops)};
                return false;
              }

              return true;
            });
            if (error) {
              return callback(error);
            }
          }

          if (spec.filters.events) {
            if (!(_.isArray(spec.filters.events) && spec.filters.events.length > 0 && spec.filters.events.every(_.isString))) {
              return callback({spec:{filters:{events:'expecting non-empty array of strings'}}});
            }
          }
        }

        if (spec.groups) {
          if (!(_.isArray(spec.groups) && spec.groups.length > 0 && spec.groups.every(_.isString))) {
            return callback({spec:{groups:'expecting non-empty array of strings'}});
          }
        }

        var sql = 'SELECT '; // it's a start...
        var select_parts = ['COUNT(DISTINCT ee.id) AS `stats_count`', 'COUNT(DISTINCT ee.uuid) AS `stats_unique`'];
        var join_parts = [];
        var group_parts = [];
        var where_parts = [];

        var cfj_id;
        if (spec.groups) {
          error = null;
          spec.groups.every(function(gr, i) {
            if (gr == 'event') {
              select_parts.push('ee.event AS event');
              group_parts.push('event');
            }
            else if (date_map[gr]) {
              select_parts.push(DB.format("DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(ee.timestamp), 'UTC', ?), ?)  AS `" + gr + '`', [project.timezone, date_map[gr]]));
              group_parts.push('`' + gr + '`');
            }
            else if (gr.match(/^[\d\w_$-]+$/)) {
              cfj_id = addCustomFieldJoin(gr);
              select_parts.push('kv_' + cfj_id + '.value AS `' + gr + '`');
              group_parts.push('`' + gr + '`');
            }
            else {
              error = {spec:{groups:{}}};
              error.spec.groups[i] = 'invalid value ' + JSON.stringify(gr);
              return false;
            }
            return true;
          });
          if (error) {
            return callback(error);
          }
        }

        if (spec.filters && spec.filters.custom) {
          var filter_field, filter_op, filter_values, qms;
          error = null;
          spec.filters.custom.every(function(cf, i) {
            filter_field = cf.field;
            filter_op = cf.op;
            filter_values = cf.values;

            var cfj_id = addCustomFieldJoin(filter_field);
            var kv_alias = 'kv_' + cfj_id;

            // make sure key is not null except for filter_op = IS NULL
            if (filter_op != 'null') {
              where_parts.push('AND ' + kv_alias + '.value IS NOT NULL');
            }

            if (filter_op == 'in') {
              if (filter_values.length > 0) {
                qms = filter_values.map(function() {return '?';}).join(',');
                where_parts.push('AND ' + kv_alias + '.value IN (' + DB.format(qms, filter_values) + ')');
              }
              else {
                error = {spec:{filters:{custom:{}}}};
                error.spec.filters.custom[i]['values'] = 'filter "in" requires at least one value';
                return false;
              }
            }
            else if (filter_op == 'null') {
              where_parts.push('AND ' + kv_alias + '.prop IS NULL');
            }
            else if (['=', '>', '>=', '<', '<='].indexOf(filter_op) >= 0) {
              if (filter_values.length == 1) {
                var val;
                try {
                  val = DB.format('?', filter_values);
                }
                catch (e) {
                  error = {spec:{filters:{custom:{}}}};
                  error.spec.filters.custom[i] = {values : 'Invalid values for filter ' + filter_op + ' ' + JSON.stringify(filter_values)};
                  return false;
                }
                where_parts.push('AND ' + kv_alias + '.value ' + filter_op + ' ' + val);
              }
              else {
                error = {spec:{filters:{custom:{}}}};
                error.spec.filters.custom[i] = {values: 'filter "' + filter_op + '" requires exactly one value'};
                return false;
              }
            }
          });
          if (error) {
            return callback(error);
          }
        }

        if (spec.filters && spec.filters.date) {
          var start_date = spec.filters.date[0] + ' 00:00:00';
          var end_date = spec.filters.date[1] + ' 23:59:59';
          where_parts.push(DB.format("AND ee.timestamp BETWEEN UNIX_TIMESTAMP(CONVERT_TZ(?, ?, 'UTC')) AND UNIX_TIMESTAMP(CONVERT_TZ(?, ?, 'UTC'))", [start_date, project.timezone, end_date, project.timezone]));
        }

        if (spec.filters && spec.filters.events) {
          qms = spec.filters.events.map(function () {return '?'}).join(',');
          where_parts.push(DB.format('AND ee.event IN (' + qms + ')', spec.filters.events));
        }

        sql += select_parts.join(', ');
        sql += "\nFROM " + main_table + ' ee ';
        sql += join_parts.join("\n");
        sql += "\nWHERE 1 ";
        sql += where_parts.join("\n");
        if (group_parts.length > 0) {
          sql += "\nGROUP BY " + group_parts.join(',');
        }

        console.log(sql);

        DB.query(sql, function(err, result) {

          console.log(result);

          if (err) {
            return callback('api error');
          }
          else {
            if (spec.compact && spec.groups.length > 0) {
              var compact_result = {};
              var target;
              result.forEach(function(r) {
                target = compact_result;
                var last_g, last_target;
                spec.groups.forEach(function(g) {
                  last_target = target;
                  last_g = r[g] || '_undefined';
                  target[last_g] = target[last_g] || {};
                  target = target[last_g];
                  delete(r[g]);
                });
                last_target[last_g] = r;
              });
              return callback(null, compact_result);
            }
            else {
              // don't need to modify the SQL result, it's exactly what we want
              return callback(null, result);
            }
          }
        });
      });
    },
    getCustomProperties: function(options, callback) {
      if (!options.project) {
        return callback({project: 'required'});
      }
      ProjectModel.getProjectInfo({project:options.project}, function (err, project) {
        if (err) {
          return callback(err);
        }

        var project_db = 'project_' + project.token;
	var sql = 'SELECT DISTINCT pn.property FROM ' + 
                  project_db + '.property_name pn JOIN ' + 
                  project_db + '.property_log pl ON pn.id = pl.property_name_id JOIN ' + 
                  project_db + '.event_log el ON pl.event_log_id = el.id JOIN ' + 
                  project_db + '.event_name en ON el.event_name_id = en.id WHERE en.event = ?';

        DB.query(sql,[options.event_name], function(err, res) {
          if (err) {
            return callback(err);
          }
          else {
            var results = [];
            res.forEach(function (r) {
              results.push(r.property);
            });

            return callback(null, results);
          }
        });
      });
    }
  };
};
