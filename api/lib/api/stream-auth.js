module.exports = function (StreamModel, ApiModel) {

  var StreamAPI = {
    getLatestEvents:ApiModel.apiProjectAuthCall(StreamModel.getLatestEvents),
    getLatestPeople:ApiModel.apiProjectAuthCall(StreamModel.getLatestPeople)
  };

  return StreamAPI;
};