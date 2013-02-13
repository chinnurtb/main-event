var Url = require('url'),
    QueryString = require('querystring');

var parse = function(str, request, callback) {
  if (str) {
    var base64_params = QueryString.unescape(str);
    if (base64_params) {
      var json_params;
      try {
        json_params = new Buffer(base64_params, 'base64').toString('utf8');
      }
      catch (e) {}

      if (json_params) {
        var params;
        try {
          params = JSON.parse(json_params);
        }
        catch (e) {}

        if (params) {
          request.query = params;
        }
      }
    }
  }
  return callback();
};

module.exports = function(request, response, next) {
  request.query = {};
  if (request.method == 'GET' || request.method == 'HEAD') {
    var parts = Url.parse(request.url);
    if (parts.query) {
      return parse(parts.query, request, next);
    }
    else {
      return next();
    }
  }
  else if (request.method == 'PUT' || request.method == 'POST') {
    var buf = '';
    request.setEncoding('utf8');
    request.on('data', function (chunk) { buf += chunk });
    request.on('end', function () {
      request.post_data = buf;
      parse(buf, request, next);
    });
  }
  else {
    return next();
  }
};