var cc = require('./common');

module.exports = function (app, FunnelAPI) {
  var FunnelController = {
    // create funnel
    create:function (request, response) {
      try {
        FunnelAPI.createFunnel(request.authenticated_project, request.query, cc.apiResponseCallback(response));
      }
      catch (e) {
        return cc.apiError(response, e);
      }
    },
     remove:function (request, response) {
       try {
          FunnelAPI.removeFunnel(request.authenticated_project, request.query, cc.apiResponseCallback(response));
          }
          catch (e) {
              return cc.apiError(response, e);
          }
      },
    info:function (request, response) {
      try {
        FunnelAPI.getFunnelInfo(request.authenticated_project, request.query, cc.apiResponseCallback(response));
      }
      catch (e) {
        return cc.apiError(response, e);
      }
    },
    stats:function (request, response) {
      try {
        FunnelAPI.getFunnelStats(request.authenticated_project, request.query, cc.apiResponseCallback(response));
      }
      catch (e) {
        return cc.apiError(response, e);
      }
    }
  };

  // map all actions in FunnelController to routes
  var funnel_resource = app.resource('funnels', FunnelController);
  funnel_resource.map('post', '/create', FunnelController.create);
  funnel_resource.map('post', '/remove', FunnelController.remove);
  funnel_resource.map('get', '/info', FunnelController.info);
  funnel_resource.map('get', '/stats', FunnelController.stats);
};