module.exports = function (EventModel, ApiModel) {

  var EventAPI = {
    getSummary: ApiModel.apiProjectAuthCall(EventModel.getSummary),
    getStats: ApiModel.apiProjectAuthCall(EventModel.getStats),
    getCustomProperties: ApiModel.apiProjectAuthCall(EventModel.getCustomProperties)
  };

  return EventAPI;
};