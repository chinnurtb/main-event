module.exports = function (AdminModel, ProjectModel) {

  var AdminAPI = {
    addProject: AdminModel.addProject,
    getProjectInfo: ProjectModel.getProjectInfo
  };

  return AdminAPI;
};