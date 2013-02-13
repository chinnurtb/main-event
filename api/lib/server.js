var express = require('express'),
    mysql = require('mysql'),
    validator = require('express-validator');
require('express-resource'); // only for side-effects of adding express::resource

exports.createInstance = function(config) {
  var APP_ROOT = __dirname + '/../';

  var app = express.createServer();

  app.APP_ROOT = APP_ROOT;
  app.APP_LIB = APP_ROOT + '/lib/';
  var DB_EVENT = mysql.createClient(config.mysql);
  var DB_API = mysql.createClient(config.mysql_api);

  // setup models/apis
  var ApiModel = require('./models/api')(DB_API);
  var ProjectModel = require('./models/project')(DB_API);
  var EventModel = require('./models/event')(DB_EVENT, ProjectModel);
  var FunnelModel = require('./models/funnel')(DB_EVENT, DB_API, ProjectModel);
  var StreamModel = require('./models/stream')(DB_EVENT, ProjectModel);
  var AdminModel = require('./models/admin')(DB_API, DB_EVENT);

  var ProjectAPI = require('./api/project-auth')(ProjectModel, ApiModel);
  var EventAPI = require('./api/event-auth')(EventModel, ApiModel);
  var FunnelAPI = require('./api/funnel-auth')(FunnelModel, ApiModel);
  var StreamAPI = require('./api/stream-auth')(StreamModel, ApiModel);
  var AdminAPI = require('./api/admin')(AdminModel, ProjectModel);

  // setup express middleware
  var auth = require('./middleware/authenticator.js')(ApiModel);
  var json_req_parser = require('./middleware/json_req_parser.js');
  var no_header = require('./middleware/no_header.js');

  app.use(json_req_parser);
  app.use(auth);
  app.use(validator);
  app.use(no_header);
  app.use(app.router);

  // setup controllers
  require('./controllers/event')(app, EventAPI);
  require('./controllers/project')(app, ProjectAPI);
  require('./controllers/funnel')(app, FunnelAPI);
  require('./controllers/stream')(app, StreamAPI);
  require('./controllers/admin')(app, AdminAPI);

  // when we close the socket, end the mysql conn so we can shutdown
  app.addListener('close', function() {
    DB_EVENT.end();
    DB_API.end();
  });

  return app;
};