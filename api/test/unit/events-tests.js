var ct = require('./common');

describe('Events', function () {

  before(function (done) {
    ct.runSqlFixtures(done);
  });

  describe('getStats', function() {

    it('should return a unique record with counts and uniques when spec is empty', function (done) {
      var params = {project:1, spec:{}};
      ct.EventModel.getStats(params, function (err, res) {
        if (err) {
          throw err;
        }
        res.length.should.eql(1);
        var stat = res[0];
        stat.should.have.property('stats_unique');
        stat.should.have.property('stats_count');
        done();
      });
    });

    it('should reject an empty custom filter', function (done) {
      var params = {project:1, spec:{filters:{custom:[
        {}
      ]}}};
      ct.EventModel.getStats(params, function (err) {
        err.should.have.property('spec');
        err.spec.should.have.property('filters');
        err.spec.filters.should.have.property('custom');
        err.spec.filters.custom.should.have.property('0');
        done();
      });
    });

    [
      {field:'', op:'=', values:[1]},
      // empty field name
      {field:'hello', op:'world'},
      // wrong filter op
      {field:'hello', op:'=', values:1} // values not an array
    ].forEach(
      function (filter_options) {
        it('should reject a malformed custom filter by returning an error in filters.custom.0', function (done) {
          var params = {project:1, spec:{filters:{custom:[filter_options]}}};
          ct.EventModel.getStats(params, function (err, res) {
            err.should.have.property('spec');
            err.spec.should.have.property('filters');
            err.spec.filters.should.have.property('custom');
            err.spec.filters.custom.should.have.property('0');
            done();
          });
        });
      });

    it('should return a response with one result if using a GROUP BY that does not exist', function (done) {
      var params = {project:1, spec:{groups:['invalid_group']}};
      ct.EventModel.getStats(params, function (err, res) {
        if (err) {
          throw err;
        }
        res.length.should.eql(1);
        var stat = res[0];
        stat.should.have.property('stats_unique');
        stat.should.have.property('stats_count');
        done();
      });
    });

    it('should return an object with a property called _undefined if using a GROUP BY that does not exist, and compact=true', function (done) {
      var params = {project:1, spec:{groups:['invalid_group'], compact:true}};
      ct.EventModel.getStats(params, function (err, res) {
        if (err) {
          throw err;
        }
        res.should.have.property('_undefined');
        res._undefined.should.have.property('stats_unique');
        res._undefined.should.have.property('stats_count');
        done();
      });
    });

  });

  describe('getCustomProperties', function () {

    it('should return the custom properties defined in the fixtures (os,browser,cohort) and nothing more', function (done) {
      var params = {project:1, event_name:'event1'};
      ct.EventModel.getCustomProperties(params, function (err, res) {
        if (err) {
          throw err;
        }
        res.should.include('os');
        res.should.include('browser');
        res.should.include('cohort');
        res.length.should.eql(3);
        done();
      });
    });

  });

  describe('getSummary', function() {

    var shouldBeSummary = function(res) {
      res.should.have.property('today');
      res.should.have.property('yesterday');
      res.should.have.property('last_7');
      res.should.have.property('last_30');
      res.should.have.property('mtd');
      res.should.have.property('itd');
    };

    it('should return a summary of valid event1 in valid project, with 4 occurrences in itd (fixtures)', function(done) {
      var params = {project:1, event_name:'event1'};
      ct.EventModel.getSummary(params, function(err, res) {
        if (err) {
          throw err;
        }
        shouldBeSummary(res);
        res.should.have.property('itd', 4);
        done();
      });
    });
  });
});