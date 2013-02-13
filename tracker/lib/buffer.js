var _step = require('step'),
    _ = require('underscore');

module.exports = function(RC, redis_ns, EventStorage) {

  var NUM_KEYS = 10;

  var EventBuffer = {

    NUM_KEYS : NUM_KEYS,

    buildKey:function (parts) {
      if (_.isArray(parts) && parts.length > 0) {
        parts.unshift(redis_ns);
        return parts.join('::');
      }
      else {
        return null;
      }
    },

    insertEventInBuffer:function (event, callback) {
      if (!_.isFunction(callback)) {
        callback = function() {};
      }
      var rand = 1 + Math.floor(Math.random() * NUM_KEYS);
      var key = EventBuffer.buildKey(['events', rand]);
      RC.rpush(key, JSON.stringify(event), callback);
    },

    flushEventsToStorage:function (callback) {

      var processEventsKey = function(events_key, callback) {
        _step(
            function() {
              RC.watch(events_key, this);
            },
            function (err, res) {
              if (err || !res) {throw err || 'buffer error';}

              RC.multi()
                  .lrange(events_key, 0, -1)
                  .del(events_key)
                  .exec(this);
            },
            // got the new events, check if there are any, delete and go to next
            function (err, replies) {
              if (err) {
                return callback();
              }

              // multi-bulk reply is null when watch "fails", we'll catch it on the next pass
              if (!_.isArray(replies)) {
                return callback();
              }

              var current_events = replies[0];
              if (_.isArray(current_events)) {
                return callback(null, current_events);
              }
              else {
                return callback();
              }
            }
        );
      };

      _step(
          // loop over all keys in parallel (using Step::group)
          function() {
            var i, key, group = this.group();
            for (i = 1; i <= NUM_KEYS; i++) {
              key = EventBuffer.buildKey(['events', i]);
              processEventsKey(key, group());
            }
          },
          function (err, results) {
            if (err) {
              return callback(err);
            }

            var current_events = [];
            results.forEach(function(r) {
              if (r) {
                current_events = current_events.concat(r);
              }
            });

            var tracked_events = {};

            // loop over all events to sort them by token
            current_events.forEach(function (evt) {
              evt = JSON.parse(evt);
              if (evt.$token) {
                tracked_events[evt.$token] || (tracked_events[evt.$token] = []);
                // add the event by token
                tracked_events[evt.$token].push(evt);
              }
            });

            var prll = this.parallel;

            Object.keys(tracked_events).forEach(function (token) {
              // here we have all the events for a given token
              // even though the token was checked before insertion, sanitize again here to be sure
              if (!token.match(EventStorage.TOKEN_REGEX)) {
                throw 'Invalid token: ' + token;
              }
              else {
                // insert everything for that table in parallel
                EventStorage.persistEvents(tracked_events[token], token, prll());
              }
            });
            prll()();
          },
          function (err) {
            return callback(err);
          }
      );
    }
  };

  return EventBuffer;
};