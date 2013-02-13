var step = require('step'),
  mysql = require('mysql'),
  fs = require('fs'),
  config = require('../config');

// initialize DBs
var DB_EVENT = mysql.createClient(config.mysql);
var DB_API = mysql.createClient(config.mysql_api);

// initialize library path
var libpath = process.env.EVENT_API_COV ? '../../lib-cov' : '../../lib';
var ProjectModel = exports.ProjectModel = require(libpath + '/models/project')(DB_API);
exports.EventModel = require(libpath + '/models/event')(DB_EVENT, ProjectModel);

// SQL fixtures
var sql_api = fs.readFileSync(__dirname + '/../fixtures/create_api_tables.sql').toString('utf8').split("\n\n");
var sql_event = fs.readFileSync(__dirname + '/../fixtures/create_event_tables.sql').toString('utf8').split("\n\n");

exports.runQueriesInSeries = function(queries, DB, callback) {
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

exports.runSqlFixtures = function(callback) {
  step(
    function () {
      exports.runQueriesInSeries(sql_api, DB_API, this.parallel());
      exports.runQueriesInSeries(sql_event, DB_EVENT, this.parallel());
    },
    function (err) {
      if (err) {
        throw err;
      }
      callback();
    }
  );
};