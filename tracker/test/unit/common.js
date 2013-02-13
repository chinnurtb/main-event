var step = require('step'),
    mysql = require('mysql'),
    redis = require('redis'),
    fs = require('fs');

var config = exports.config = require('../config');

// initialize DB
var DB = exports.DB = mysql.createClient(config.mysql);
var RC = exports.RC = redis.createClient(config.redis.port, config.redis.host);

// initialize library path
var libpath = process.env.EVENT_SERVER_COV ? '../../lib-cov' : '../../lib';
var EventStorage = exports.EventStorage = require(libpath + '/storage')(DB);
var EventBuffer = exports.EventBuffer = require(libpath + '/buffer')(RC, config.redis.namespace, EventStorage);

// SQL fixtures
var sql_create = fs.readFileSync(__dirname + '/../fixtures/create_stats.sql').toString('utf8').split("\n\n");
var sql_reset = fs.readFileSync(__dirname + '/../fixtures/reset_stats.sql').toString('utf8').split("\n\n");

exports.runQueriesInSeries = function (queries, DB, callback) {
  (function loop(err) {
    if (err) {
      callback(err);
    }
    var sq;
    if (sq = queries.shift()) {
      DB.query(sq, loop);
    }
    else {
      callback();
    }
  })();
};

exports.runCreateSql = function (callback) {
  exports.runQueriesInSeries(sql_create, DB, callback);
};

exports.runReset = function (callback) {
  step(
      function() {
        exports.runQueriesInSeries(sql_reset, DB, this.parallel());
        for (var i = 1; i <= EventBuffer.NUM_KEYS; i++) {
          RC.del(EventBuffer.buildKey(['events', i]), this.parallel());
        }
      },
      function(err) {
        callback(err);
      }
  );
};