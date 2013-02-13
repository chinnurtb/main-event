var step = require('step'),
  _ = require('underscore');

module.exports = function(DB_API) {
  // get the valid timezones
  var VALID_TIMEZONES = require('./valid_timezones');

  return {
    VALID_TIMEZONES : VALID_TIMEZONES,

    getProjectInfo:function(options, callback) {
      if (!_.isNumber(options.project)) {
        return callback({project: 'required'});
      }
      DB_API.query('SELECT id,name,timezone,token,api_key,api_secret FROM projects WHERE id = ?;', [options.project], function(err, result) {
        if (err) {
          callback(err);
        }
        else if (result.length != 1) {
          callback({project: 'not found'});
        }
        else {
          callback(null, result[0]);
        }
      });
    },

    setProjectTimezone:function(options, callback) {
      if (!_.isNumber(options.project)) {
        return callback({project: 'required'});
      }
      if (VALID_TIMEZONES.indexOf(options.timezone) >= 0) {
        DB_API.query('UPDATE projects SET timezone = ? WHERE id = ?', [options.timezone, options.project], function(err, res) {
          if (err) {
            callback(err);
          }
          else if (!res.affectedRows) {
            callback({project: 'not found'});
          }
          else {
            callback(null, 'OK');
          }
        });
      }
      else {
        callback({timezone: 'invalid timezone: ' + options.timezone});
      }
    },

    getFunnels:function(options, callback) {
      if (!_.isNumber(options.project)) {
        return callback({project:'required'});
      }

      DB_API.query('SELECT pf.id, pf.name, fe.event FROM projects_funnels pf JOIN funnel_events fe ON pf.id=fe.funnel_id WHERE pf.project_id = ? ORDER BY fe.funnel_id,fe.ord', [options.project], function(err, res) {
        if (err) {
          return callback(err);
        }
        var funnels = {};
        res.forEach(function(r) {
          if (!funnels[r.id]) {
            funnels[r.id] = {id:r.id, name:r.name, events:[]}
          }
          funnels[r.id].events.push(r.event);
        });
        // convert to array
        var project_funnels = [];
        Object.keys(funnels).forEach(function(k) {
          project_funnels.push(funnels[k]);
        });

        return callback(null, project_funnels);
      });
    },

    updateProject: function(options, callback) {
      if(!_.isNumber(options.project)) {
        return callback({project: 'required'});
      }
      if(!options.name) {
        return callback({name: 'required'});
      }
      if(VALID_TIMEZONES.indexOf(options.timezone) >= 0) {
        project_id = parseInt(options.project, 10);
        step(
          function() {
            DB_API.query('UPDATE projects SET name = ?, timezone = ? WHERE id = ?', [options.name, options.timezone, project_id], this);
          },
          function(err, res) {
            if (err) {
              return callback(err);
            }
            else if(res.affectedRows == 1) {
              return callback(null, {id: project_id});
            }
            else {
              return callback('api error: update failed');
            }
          }
        );
      }
      else {
        return callback('invalid timezone');
      }
    }
  }
};
