var ct = require('./common');

describe('Project', function () {

  before(function (done) {
    ct.runSqlFixtures(done);
  });

  describe('getProjectInfo', function() {

    it('should return a record with project defined in fixtures', function (done) {
      var params = {project:1};
      ct.ProjectModel.getProjectInfo(params, function (err, res) {
        if (err) {
          throw err;
        }
        res.should.have.property('name', 'TESTING');
        res.should.have.property('timezone', 'UTC');
        done();
      });
    });

    it('should return an error for a non-existing project', function (done) {
      var params = {project:2};
      ct.ProjectModel.getProjectInfo(params, function (err) {
        err.should.have.property('project', 'not found');
        done();
      });
    });
  });

  describe('setProjectTimezone', function() {
    it('should return an OK response for an existing project', function (done) {
      var params = {project:1, timezone:'UTC'};
      ct.ProjectModel.setProjectTimezone(params, function (err, res) {
        if (err) {
          throw err;
        }
        res.should.eql('OK');
        done();
      });
    });

    it('should return an error for a non-existing project', function (done) {
      var params = {project:2, timezone:'UTC'};
      ct.ProjectModel.setProjectTimezone(params, function (err) {
        err.should.have.property('project', 'not found');
        done();
      });
    });

    it('should return an error for an invalid timezone', function (done) {
      var params = {project:1, timezone:'XXX'};
      ct.ProjectModel.setProjectTimezone(params, function (err) {
        err.should.have.property('timezone');
        err.timezone.should.match(/invalid/i);
        done();
      });
    });
  });
});