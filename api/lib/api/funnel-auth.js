module.exports = function (FunnelModel, ApiModel) {

  var FunnelAPI = {
    createFunnel: ApiModel.apiProjectAuthCall(FunnelModel.createFunnel),
    removeFunnel: ApiModel.apiProjectAuthCall(FunnelModel.removeFunnel),
    getFunnelInfo: ApiModel.apiFunnelAuthCall(FunnelModel.getFunnelInfo),
    getFunnelStats: ApiModel.apiFunnelAuthCall(FunnelModel.getFunnelStats)
  };

  return FunnelAPI;
};