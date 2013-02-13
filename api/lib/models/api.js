var _ = require('underscore'),
  crypto = require('crypto');

module.exports = function(DB_API) {

  /**
   * How much slack to allow in the timestamp value when computing the signature of an API call
   * The smaller the number, the less difference there can be between the clocks of the caller and callee
   * @type {Number}
   */
  var TIMESTAMP_LATITUDE = 120;

  var ApiModel = {
    // authenticate the api call by checking whether the signature matches the payload for the given key and timestamp (wiggle room for timestamp)
    authenticateApiCall: function(options, callback) {
      // check if options are passed properly
      if (!(options && [options.api_key, options.signature, options.timestamp, options.request].every(_.isString))) {
        return callback('required options: api_key, signature, timestamp, request');
      }

      // check if the timestamp provided is between the bounds
      var current_ts = Math.floor(Date.now() / 1000);
      var request_ts = parseInt(options.timestamp);
      if (isNaN(request_ts) || request_ts < 0) {
        return callback({timestamp: 'required positive integer'});
      }
      if (!(current_ts - TIMESTAMP_LATITUDE <= request_ts && request_ts <= current_ts + TIMESTAMP_LATITUDE)) {
        return callback({timestamp: request_ts + ' is out of bounds. server timestamp: ' + current_ts});
      }

      // fetch the secret for the given key
      DB_API.query('SELECT id, api_secret FROM projects WHERE api_key = ?', [options.api_key], function(err, res) {
        if (err) {
          return callback(err);
        }
        else if (res.length != 1) {
          return callback({api_key: 'not found'});
        }
        res = res[0];

        // here we have the secret, compute the signature as SHA1 of timestamp:secret:request
        var sig = crypto.createHash('sha1');
        var to_sign = [options.timestamp, res.api_secret, options.request].join(':');
        sig.update(to_sign);
        // if signature matches, return corresponding project ID
        if (sig.digest('hex') == options.signature) {
          return callback(null, res.id);
        }
        else {
          return callback({signature: 'invalid signature'});
        }
      });
    },
    // check if authorized to make call for this project
    apiProjectAuthCall : function(api_call) {
      return function (authenticated_project, options, callback) {
        authenticated_project = parseInt(authenticated_project) || 0;

        // If project is passed, check project auth
        if(_.isNumber(options.project) && authenticated_project) {
          if (options.project == authenticated_project) {
            api_call(options, callback);
          }
          else {
            callback({project: 'not authorized'});
          }
        }
        else {
          callback({project: 'required project ID'});
        }
      }
    },
    // check if authorized to make calls for this funnel
    apiFunnelAuthCall:function (api_call) {
      return function (authenticated_project, options, callback) {
        authenticated_project = parseInt(authenticated_project) || 0;

        // If funnel is passed, check its project ID
        if (_.isNumber(options.funnel)) {
          DB_API.query('SELECT project_id from projects_funnels where id = ?', [options.funnel], function(err, res) {
            if (err) {
              return callback(err);
            }
            else if (res.length != 1) {
              return callback({funnel: 'not found'});
            }
            else if (parseInt(res[0].project_id) != authenticated_project) {
              return callback({funnel:'not authorized'});
            }
            else {
              api_call(options, callback);
            }
          });
        }
        else {
          callback({funnel:'required funnel ID'});
        }
      }
    }
  };

  return ApiModel;
};