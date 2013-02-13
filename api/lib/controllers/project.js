var cc = require('./common');

module.exports = function(app, ProjectAPI) {
  var ProjectController = {
    info:function(request, response) {
      try {
        ProjectAPI.getProjectInfo(request.authenticated_project, request.query, cc.apiResponseCallback(response));
      }
      catch (e) {
        cc.apiError(response, e);
      }
    },
    timezones:function (request, response) {
      return cc.apiResult(response, ProjectAPI.VALID_TIMEZONES);
    },
    set_timezone:function (request, response) {
      try {
        ProjectAPI.setProjectTimezone(request.authenticated_project, request.query, cc.apiResponseCallback(response));
      }
      catch (e) {
        cc.apiError(response, e);
      }
    },
    funnels: function(request, response) {
      try {
        ProjectAPI.getFunnels(request.authenticated_project, request.query, cc.apiResponseCallback(response));
      }
      catch (e) {
        cc.apiError(response, e);
      }
    },
    update: function(request, response) {
      try {
        ProjectAPI.updateProject(request.authenticated_project, request.query, cc.apiResponseCallback(response));
      }
      catch(e) {
        cc.apiError(response, e);
      }
    }
  };

  // map all actions in ProjectController to routes
  var project_resource = app.resource('project', ProjectController);
  project_resource.map('get', '/info', ProjectController.info);
  project_resource.map('get', '/timezones', ProjectController.timezones);
  project_resource.map('get', '/funnels', ProjectController.funnels);
  project_resource.map('post', '/set_timezone', ProjectController.set_timezone);
  project_resource.map('post', '/update', ProjectController.update);
};