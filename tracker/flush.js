var _fs = require('fs'),
    _redis = require('redis'),
    _mysql = require('mysql');

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
var MC = _mysql.createClient(config.mysql);
var EventStorage = require(__dirname + '/lib/storage.js')(MC);

var RC = _redis.createClient(config.redis.port, config.redis.host);
var EventBuffer = require(__dirname + '/lib/buffer.js')(RC, config.redis.namespace, EventStorage);

var EventFlush = require(__dirname + '/lib/flush.js')(EventBuffer, function(err) {console.log(err);});
EventFlush.start();
console.log('Event flush started');
