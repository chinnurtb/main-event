var _srv = require(__dirname + '/lib/server.js'),
    _fs = require('fs'),
    _redis = require('redis');

// read configuration from current environment file
var conf_json, config, env = process.env.NODE_ENV || 'production', cfile = __dirname + '/conf/config-' + env + '.json';
try {
  conf_json = _fs.readFileSync(cfile);
}
catch (e) {
  console.log(cfile + ' not found. Copy from config.template.json and modify accordingly.');
  process.exit(1);
}

try {
  config = JSON.parse(conf_json);
}
catch (e) {
  console.log('config.json bad format');
  process.exit(1);
}

// initialize connections
var RC = _redis.createClient(config.redis.port, config.redis.host);
var EventBuffer = require(__dirname + '/lib/buffer.js')(RC, config.redis.namespace);

// initialize http server
var server = _srv.createInstance(EventBuffer);
var port = config.app.listen_port;
server.listen(port);
server.addListener('close', function () {
  RC.end();
});
console.log('Event server started on port ' + port + ' in environment ' + env);