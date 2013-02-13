define(['jquery', 'base64', 'sha1', 'json2'], function($, Base64, sha1) {
  var ReportingAPI = function(api_info) {
    this.api_info = api_info;
  }

  ReportingAPI.prototype.runRequest = function(path, options, callback) {
    var data = escape(Base64.encode(JSON.stringify(options)));
    var current_timestamp = Math.floor(new Date().getTime() / 1000);
    var to_sign = [current_timestamp, this.api_info.api_secret, data].join(':');
    var signature = current_timestamp + ':' + sha1(to_sign);
    var api_key = this.api_info.api_key

    $.ajax({
      url: '/api' + path,
      type: 'GET',
      dataType: 'json',
      data: data,
      beforeSend: function(xhr) {
        xhr.setRequestHeader('X-Api-Key', api_key);
        xhr.setRequestHeader('X-Api-Sig', signature);
      },
      success: function(data) {
        if (data.error) {
          console.log('API ERROR >>> ' + data.error);
        }
        else if (data.response) {
          callback(data.response);
        }
        else {
          console.log('API ERROR >>> Invalid response: ' + JSON.stringify(data));
        }
      }
    });
  }

  ReportingAPI.prototype.getLatestPeople = function(options, callback) {
    this.runRequest('/stream/people', options, callback);
  }

  ReportingAPI.prototype.getLatestEvents = function(options, callback) {
    this.runRequest('/stream/latest', options, callback);
  }

  return ReportingAPI;
});