var ct = require('./common'),
    step = require('step');

describe('EventStorage', function () {

  before(function (done) {
    ct.runCreateSql(done);
  });

  describe('persistEvents', function () {

    beforeEach(function (done) {
      ct.runReset(done);
    });

    it('should add events without custom data', function(done) {
      step(
          function() {
            ct.EventStorage.persistEvents([{$event:'pageview', token:'TESTING', $time: 1, $uuid: 1}, {$event:'install', token:'TESTING', $time: 1, $uuid: 2}], 'TESTING', this);
          },
          function() {
            ct.DB.query('SELECT COUNT(*) as num_events FROM events_TESTING', this);
          },
          function(err, res) {
            res.length.should.eql(1);
            res[0].should.have.property('num_events', 2);
            done();
          }
      );
    });

    it('should add event with custom data', function(done) {
      step(
          function() {
            ct.EventStorage.persistEvents([{$event:'pageview', token:'TESTING', $time: 1, $uuid: 1, $data: {cohort: 1}}], 'TESTING', this);
          },
          function() {
            ct.DB.query('SELECT COUNT(*) AS num_props FROM event_values_TESTING;', this);
          },
          function(err, num_pr) {
            num_pr.length.should.eql(1);
            num_pr[0].should.have.property('num_props', 1);
            done();
          }
      );
    });
  });
});