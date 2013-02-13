var cc = require('./common');

module.exports = function (app, AdminAPI) {
  var AdminController = {
    add_project:function (request, response) {
      if (request.authenticated_admin) {
        try {
          AdminAPI.addProject(request.query, cc.apiResponseCallback(response));
        }
        catch (e) {
          cc.apiError(response, e);
        }
      }
      else {
        cc.apiError(response, 'not authenticated');
      }
    },
    project_info:function(request, response) {
      if (request.authenticated_admin) {
        try {
          AdminAPI.getProjectInfo(request.query, cc.apiResponseCallback(response));
        }
        catch (e) {
          cc.apiError(response, e);
        }
      }
      else {
        cc.apiError(response, 'not authenticated');
      }
    }
  };

  // map all actions in ProjectController to routes
  var admin_resource = app.resource('admin', AdminController);
  admin_resource.map('post', '/add_project', AdminController.add_project);
  admin_resource.map('get', '/project_info', AdminController.project_info);
};