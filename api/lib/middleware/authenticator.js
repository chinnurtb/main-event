var Url = require('url'),
  _ = require('underscore');

module.exports = function(ApiModel) {
  return function (request, response, next) {
    var authResponse = function (err, project_id) {
      if (err) {
        response.json({error:err}, 401);
      }
      else {
        request.authenticated_project = project_id;
        return next();
      }
    };

    var auth_header = request.header('x-authenticated');
    if (auth_header == 'true') {
      request.authenticated_admin = true;
      return next();
    }
    else {
      request.authenticated_admin = false;
    }

    var api_key = request.header('x-api-key');
    var api_sig = request.header('x-api-sig');

    if (![api_key,api_sig].every(_.isString)) {
      return authResponse('required headers x-api-key and x-api-sig');
    }

    if (!api_sig.match(/\d+:[\d\w]+/i)) {
      return authResponse({signature: 'bad signature. format is timestamp:sha1'});
    }

    var sig_parts = api_sig.split(':');
    var timestamp = sig_parts[0], signature = sig_parts[1];

    if (request.method == 'GET' || request.method == 'HEAD') {
      var parts = Url.parse(request.url);
      ApiModel.authenticateApiCall({api_key: api_key, signature: signature, timestamp: timestamp, request: parts.query || ''}, authResponse);
    }
    else if (request.method == 'POST' || request.method == 'PUT') {
      ApiModel.authenticateApiCall({api_key: api_key, signature: signature, timestamp: timestamp, request: request.post_data}, authResponse);
    }
  };
};