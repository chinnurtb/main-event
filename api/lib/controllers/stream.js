var cc = require('./common');

module.exports = function (app, StreamAPI) {
  var StreamController = {
    // latest events
    latest:function (request, response) {
      try {
        StreamAPI.getLatestEvents(request.authenticated_project, request.query, cc.apiResponseCallback(response));
      }
      catch (e) {
        return cc.apiError(response, e);
      }
    },
    // latest people
    people:function (request, response) {
      try {
        StreamAPI.getLatestPeople(request.authenticated_project, request.query, cc.apiResponseCallback(response));
      }
      catch (e) {
        return cc.apiError(response, e);
      }
    }
  };

  // map all actions in FunnelController to routes
  var stream_resource = app.resource('stream', StreamController);
  stream_resource.map('get', '/latest', StreamController.latest);
  stream_resource.map('get', '/people', StreamController.people);
};