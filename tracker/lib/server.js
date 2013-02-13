var _http = require('http'),
    _url = require('url'),
    _cookies = require('cookies'),
    _crypto = require('crypto'),
    _nuuid = require('node-uuid');

var getSetUuid = function (req, res) {
  var cjar = new _cookies(req, res);
  var uuid = cjar.get('PLRZ');
  if (!uuid) {
    var exp_date = new Date();
    exp_date.setFullYear(exp_date.getFullYear() + 1);
    var sha_sum = _crypto.createHash('sha1');
    uuid = sha_sum.update(_nuuid.v4()).digest('hex');

    cjar.set('PLRZ', uuid, {httpOnly:false, expires:exp_date});
  }
  return uuid;
};

var parseData = function(data, callback) {
  if (data.match(/^data=/)) {
    data = data.replace(/^data=/, '');
  }
  var json_data;
  try {
    json_data = new Buffer(data, 'base64').toString('utf8');
  }
  catch (e) {
    return callback('invalid base64 data');
  }

  var parsed_data;
  try {
    parsed_data = JSON.parse(json_data);
  }
  catch (e) {
    return callback('invalid json data');
  }
  return callback(null, parsed_data);
};

var getBase64Data = function (req, callback) {
  if (req.method == 'PUT' || req.method == 'POST') {
    var buf = '';
    req.setEncoding('utf8');
    req.on('data', function (chunk) { buf += chunk });
    req.on('end', function () {
      return parseData(buf, callback);
    });
  }
  else if (req.method == 'GET') {
    var params = _url.parse(req.url, true).query;
    if (!params.data) {
      return callback('GET request requires data parameter');
    }
    return parseData(params.data, callback);
  }
  else {
    return callback('invalid method: ' + req.method);
  }
};

var serverError = function (res, code) {
  res.writeHead(code || 500, {'Connection':'close'});
  res.end();
  return false;
};

exports.createInstance = function(EventBuffer) {
  var requestHandler = function (req, res) {

    // make sure requests are going to /track
    if (!req.url.match(/^\/track\/?(\?|$)/)) {
      res.writeHead(404, {Connection: 'close'});
      res.end();
      return false;
    }

    // get event parameters from http
    getBase64Data(req, function(err, params) {

      if (err) {
        res.writeHead(500, {Connection: 'close', "X-Error": err.toString()});
        res.end();
        return false;
      }

      var data, tracked_event;
      if (!(params && params.event && params.properties)) {
        res.writeHead(500, {Connection: 'close', "X-Error": 'required event and properties'});
        res.end();
        return false;
      }
      data = params.properties;

      // Create the event
      tracked_event = {};

      // add event name
      tracked_event.$event = params.event;
      tracked_event.$token = data.token;

      // get UUID from either params or cookie
      tracked_event.$uuid = data.distinct_id || getSetUuid(req, res);

      // get IP from forwarded header or from connection
      var fwd_ip;
      var fwds = req.headers['x-forwarded-for'];
      if (fwds) {
        var forwarded_ips = fwds.split(',');
        if (forwarded_ips.length > 0) {
          fwd_ip = forwarded_ips[forwarded_ips.length - 1];
        }
      }
      tracked_event.$ip = fwd_ip || req.headers['x-real-ip'] || req.connection.remoteAddress;

      // get event time from data or from server
      tracked_event.$time = data.time || Math.round(Date.now() / 1000);

      // add all other data
      delete(data.distinct_id);
      delete(data.time);
      delete(data.token);
      tracked_event.$data = data;

      // insert event in redis buffer
      EventBuffer.insertEventInBuffer(tracked_event);


      // end connection, no need to wait for redis to complete
      res.writeHead(200, {'Content-Type':'text/plain', 'Connection':'close'});
      res.end();
      return true;
    });
  };

  var srv = _http.createServer();
  srv.addListener('request', requestHandler);

  return srv;
};