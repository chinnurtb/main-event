var _ = require('underscore');

var DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

module.exports = function (DB_EVENT, DB_API, ProjectModel) {

  DB_EVENT.query("SET time_zone='UTC';");

  var FunnelModel = {
    createFunnel:function(options, callback) {
      if (!options.project) {
        return callback({project:'required project ID'});
      }
      else if (!_.isString(options.name) || options.name.length == 0) {
        return callback({name:'required funnel name'});
      }
      else if (!_.isArray(options.events) || options.events.length < 2 || !options.events.every(_.isString)) {
        return callback({events:'required, array of at least 2 event names'});
      }
      // make sure project exists
      ProjectModel.getProjectInfo({project:options.project}, function(err, project) {
        if (err) {
          return callback(err);
        }

        // create funnel
        var funnel_id;
        DB_API.query('INSERT INTO `projects_funnels` (`project_id`,`name`) VALUES (?, ?);', [options.project, options.name], function(err, res) {
          if (err) {
            return callback(err);
          }
          else if (!res.insertId) {
            return callback('api error');
          }
          else {
            funnel_id = res.insertId;
          }

          // insert funnel events
          var ev_query = 'INSERT INTO `funnel_events` (`funnel_id`,`ord`,`event`) VALUES ';
          var ev_values = [];
          options.events.forEach(function(event, ord) {
            ev_values.push(DB_API.format('(?,?,?)', [funnel_id, ord, event]));
          });
          ev_query += ev_values.join(',') + ';';
          DB_API.query(ev_query, function(err, res) {
            if (err) {
              return callback(err);
            }
            // funnel has been created, return its ID
            return callback(null, {id: funnel_id});
          });
        });
      });
    },
      removeFunnel:function(options, callback) {
          if (!options.project) {
              return callback({project:'required project ID'});
          }
          else if (!options.funnel) {
              return callback({funnel:'required funnel ID'});
          }

          // make sure project exists
          ProjectModel.getProjectInfo({project:options.project}, function(err, project) {
              if (err) {
                  return callback(err);
              }

              // remove funnel
              var project_query = 'DELETE FROM `projects_funnels` WHERE `id`= ?;';
              DB_API.query(project_query, [options.funnel], function(err, res) {
                  if (err) {
                      return callback(err);
                  }
                  else if (res.affectedRows == 1) {
                      var funnel_query = 'DELETE FROM `funnel_events` WHERE `funnel_id`= ?;';

                      DB_API.query(funnel_query, [options.funnel], function(err, res) {
                          if (err) {
                              return callback(err);
                          }
                          else if (res.affectedRows >= 1) {
                              return callback(null ,'success');
                          }
                          else{
                              return callback('Could not delete funnel events');
                          }
                      });

                  }
                  else{
                      return callback('Could not delete project funnels');
                  }
              // remove funnel events


             });
       });
      },

    getFunnelInfo:function(options, callback) {
      if (!options.funnel) {
        return callback({funnel:'required funnel ID'});
      }
      DB_API.query('SELECT pf.id, pf.project_id, pf.name, fe.event FROM projects_funnels pf JOIN funnel_events fe ON pf.id=fe.funnel_id WHERE pf.id = ? ORDER BY fe.ord ASC;', [options.funnel], function(err, res) {
        if (err) {
          return callback(err);
        }
        if (!_.isArray(res) || res.length == 0) {
          return callback({funnel: 'not found'});
        }

        var funnel_info = {id: res[0].id, name: res[0].name, project: res[0].project_id, events:[]};
        res.forEach(function(r) {
          funnel_info.events.push(r.event);
        });

        return callback(null, funnel_info);
      });
    },
    getFunnelStats:function(options, callback) {
      if (!options.funnel) {
        return callback({funnel:'required funnel ID'});
      }
      if (!_.isString(options.start_date) || !options.start_date.match(DATE_REGEX)) {
        return callback({start_date:'required yyyy-mm-dd'});
      }
      if (!_.isString(options.end_date) || !options.end_date.match(DATE_REGEX)) {
        return callback({end_date:'required yyyy-mm-dd'});
      }


      FunnelModel.getFunnelInfo({funnel:options.funnel}, function(err, funnel_info) {

        if (err) {
          return callback(err);
        }

        // get the project info
        ProjectModel.getProjectInfo({project:funnel_info.project}, function(err, project_info) {
          if (err) {
            return callback(err);
          }

          var events_table = 'events_'+project_info.token;

          var funnel_query = 'SELECT ';

          var event_names = [];
          funnel_info.events.forEach(function(event, ord) {
            event_names.push('event_'+ord);
          });

          funnel_query += event_names.join(', ');

          for(var i = 0; i < (funnel_info.events.length - 1); i++) {
            funnel_query += ', AVG(ts_'+(i+1)+' - ts_'+i+') AS gap_'+i;
            funnel_query += ', MAX(ts_'+(i+1)+' - ts_'+i+') AS maxgap_'+i;
            funnel_query += ', STDDEV(ts_'+(i+1)+' - ts_'+i+') AS stdgap_'+i;
          }

          funnel_query += ', COUNT(*) AS num';
          funnel_query += ' FROM (SELECT IF (@uuid = e0.uuid COLLATE utf8_general_ci AND @ts = e0.timestamp, @rn := @rn + 1 + LEAST(0, @uuid:=e0.uuid, @ts:=e0.timestamp), @rn := 1 + LEAST(0, @uuid:=e0.uuid, @ts:=e0.timestamp)) AS rn,';
          funnel_query += ' e0.uuid AS uuid';
          funnel_info.events.forEach(function(event, ord) {
            funnel_query += ', e'+ord+'.event AS event_'+ord;
            funnel_query += ', e'+ord+'.timestamp AS ts_'+ord;
          });

          funnel_query += ' FROM (SELECT @uuid := 0, @ts := 0) init, '+events_table+' e0';

          var query_values = [];

          for(var j = 1; j < funnel_info.events.length; j++) {
            funnel_query += ' LEFT JOIN '+events_table+' e'+j;
            funnel_query += ' ON e'+(j-1)+'.uuid = e'+j+'.uuid';
            funnel_query += ' AND e'+(j-1)+'.timestamp < e'+j+'.timestamp';
            funnel_query += ' AND e'+j+'.event = ?';
            query_values.push(funnel_info.events[j]);
          }

          funnel_query += ' WHERE e0.event = ?';
          query_values.push(funnel_info.events[0]);

          funnel_query += ' AND e0.timestamp BETWEEN UNIX_TIMESTAMP(CONVERT_TZ(?, ?, "UTC")) AND UNIX_TIMESTAMP(CONVERT_TZ(?, ?, "UTC"))';
          query_values.push(options.start_date + ' 00:00:00', project_info.timezone, options.end_date + ' 23:59:59', project_info.timezone);

          funnel_query += ' ORDER BY e0.uuid';

          event_names.forEach(function(event, ord) {
            funnel_query += ', e'+ord+'.timestamp';
          });

          funnel_query += ') x WHERE rn = 1 GROUP BY '+event_names.join(', ')+';';

          DB_EVENT.query(funnel_query, query_values, callback);
        });
      });
    }
  };

  return FunnelModel;
};