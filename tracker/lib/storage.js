var _step = require('step'),
  _ = require('underscore');

module.exports = function(MC) {

  var dot2num = function (dot) {
    if (!_.isString(dot)) {
      return 0;
    }

    var dots = dot.split('.');
    if (dots.length != 4) {
      return 0;
    }

    return Math.abs(((((((+dots[0]) * 256) + (+dots[1])) * 256) + (+dots[2])) * 256) + (+dots[3]));
  };

  var insertCustomValues = function (db, event, token, callback) {
    return function (err, res) {
      if (err || !res || !res.insertId) {
        return callback({error:err || 'event insertion failed', event:event});
      }
      var event_id = res.insertId;

      var values_query = 'INSERT INTO '+db+'.property_log (event_log_id,property_name_id,property_value_id) VALUES ';
      if (_.isObject(event.$data)) {
        Object.keys(event.$data).forEach(function (ckey) {
          if (event.$data[ckey]) {
            var cv = [
              event_id,
            ];
            _step(
              function lookupName() {
                EventStorage.findOrCreateRow(db, 'property_name','property',ckey, this);
              },
              function lookupValue(err,res) {
                if (err) {
                  return callback(err);
                }
                cv.push(res);
                EventStorage.findOrCreateRow(db, 'property_value','value',event.$data[ckey],this);
              },
              function doInsert(err,res) {
                if (err) {
                  return callback(err);
                }
                cv.push(res);
                newtext= MC.format(' (?,?,?)', cv);
                var sql = values_query + newtext;
                var q = MC.query(sql, function(err) {
                  if (err) {
                    return callback(err);
                  }
                  else {
                    return callback(null, event_id);
                  }
                });
                console.log(q.sql);
              }
            );
          }
        });
      }
    };
  };

  var EventStorage = {

    TOKEN_REGEX : new RegExp(/^[0-9a-z]+$/i),

    persistEvent : function (event, token, callback) {
      if (!token.match(EventStorage.TOKEN_REGEX)) {
        callback('Invalid token: ' + token);
      }

      // make sure $event and $time are set
      if (_.isEmpty(event.$event)) {
        return callback({error:'$event is empty', event:event});
      }
      else if (!(event.$time > 0)) {
        return callback({error:'$time not > 0', event:event});
      }
      else if (!event.$uuid) {
        return callback({error: '$uuid required', event:event});
      }
      else {
        // add the part of the query to put the event + basic values in main table
        var db = 'project_'+token;
        var query = 'INSERT INTO '+db+'.event_log (id,timestamp,ip,event_name_id,visitor_id) VALUES (NULL,?,?,?,?);';
        var basic_values = [
          event.$time,
          dot2num(event.$ip),
        ];
        _step(
          function lookupEvent() {
            EventStorage.findOrCreateRow(db,'event_name','event',event.$event, this);
          },
          function lookupVisitor(err,res) {
            if (err) {
              return callback(err);
            }
            basic_values.push(res);
            EventStorage.findOrCreateRow(db, 'visitor', 'uuid',event.$uuid, this);
          },
          function doInsert(err,res) {
            if (err) {
              return callback(err);
            }
            basic_values.push(res);
            var q = MC.query(query, basic_values, insertCustomValues(db, event, token, callback));
            console.log(q.sql);
          }
        );
      }
    },

    findOrCreateRow : function (db, table, col, value, callback) {
      var fullTable = db+'.'+table;
      var query = 'INSERT into '+fullTable+' ('+col+') values (?) on duplicate key update id=last_insert_id(id)';
      MC.query(query, [value], function(err, res) {
        if (err) {
          return callback(err);
        }
        id = res.insertId;
        console.log('findOrCreateRow '+table+'.'+col+'('+value+') from sql got id='+id);
        return callback(null, id);
      });
    },
    persistEvents : function (events, token, callback) {
      if (!token.match(EventStorage.TOKEN_REGEX)) {
        callback('Invalid token: ' + token);
      }

      _step(
        function() {
          var prll = this.parallel;

          events.forEach(function (evt) {
            EventStorage.persistEvent(evt, token, prll());
          });
          prll()();
        },
        // done inserting events, return to callback
        function(err) {
          return callback(err);
        }
      );
    }
  };

  return EventStorage;
};
