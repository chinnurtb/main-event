var srv = require('./lib/server');
var conf = require('./config');

var server = srv.createInstance(conf);
server.listen(conf.app.listen_port, '127.0.0.1');

console.log('event-api server running on port ' + conf.app.listen_port);