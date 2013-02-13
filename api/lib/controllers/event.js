var cc = require('./common');

module.exports = function(app, EventAPI) {
  var EventController = {
    // get a summary for a certain event of its count for:
    // today, last 7d, last 30d, wtd, mtd, itd
    summary:function (request, response) {
      try {
        EventAPI.getSummary(request.authenticated_project, request.query, cc.apiResponseCallback(response));
      }
      catch (e) {
        return cc.apiError(response, e);
      }
    },
    stats:function(request, response) {
      try {
        EventAPI.getStats(request.authenticated_project, request.query, cc.apiResponseCallback(response));
      }
      catch (e) {
        return cc.apiError(response, e);
      }
    },
    custom:function(request, response) {
      try {
        EventAPI.getCustomProperties(request.authenticated_project, request.query, cc.apiResponseCallback(response));
      }
      catch (e) {
        return cc.apiError(response, e);
      }
    }
  };

  // map all actions in EventController to routes
  var event_resource = app.resource('events', EventController);
  event_resource.map('get', '/summary', EventController.summary);
  event_resource.map('get', '/stats', EventController.stats);
  event_resource.map('get', '/custom', EventController.custom);
};