module.exports = function(ProjectModel, ApiModel) {

  var ProjectAPI = {
    VALID_TIMEZONES: ProjectModel.VALID_TIMEZONES,
    getProjectInfo: ApiModel.apiProjectAuthCall(ProjectModel.getProjectInfo),
    setProjectTimezone: ApiModel.apiProjectAuthCall(ProjectModel.setProjectTimezone),
    addProject: ApiModel.apiProjectAuthCall(ProjectModel.addProject),
    getFunnels: ApiModel.apiProjectAuthCall(ProjectModel.getFunnels),
    updateProject: ApiModel.apiProjectAuthCall(ProjectModel.updateProject)
  };

  return ProjectAPI;
};