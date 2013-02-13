var ct = require('./common'),
    step = require('step'),
    assert = require('assert');

describe('EventBuffer', function () {

  before(function (done) {
    ct.runCreateSql(done);
  });

  beforeEach(function(done) {
    ct.runReset(done);
  });

  describe('buildKey', function () {

    it('should return null if argument is not an array', function (done) {
      var key = ct.EventBuffer.buildKey("not an array");
      assert.equal(key, null);
      done();
    });

    it ('should return null without arguments', function(done) {
      var key = ct.EventBuffer.buildKey();
      assert.equal(key, null);
      done();
    });

    it('should return the namespace followed by :: followed by each part separated by ::', function(done) {
      var key = ct.EventBuffer.buildKey(['test']);
      key.should.be.eql([ct.config.redis.namespace, 'test'].join('::'));
      done();
    });
  });

  describe('insertEventInBuffer', function() {
    it ('should add the event in one of the NUM_KEYS partitions used to spread out events', function(done) {
      step(
          function() {
            ct.EventBuffer.insertEventInBuffer({event:'pageview', 'token':'TESTING'}, this);
          },
          function() {
            var gr = this.group();
            for (var i = 1; i <= ct.EventBuffer.NUM_KEYS; i++) {
              ct.RC.llen(ct.EventBuffer.buildKey(['events', i]), gr());
            }
          },
          function(err, res) {
            var total = 0;
            res.forEach(function(r) {
              total += r || 0;
            });
            total.should.eql(1);
            done();
          }
      );
    });
  });

  describe('flushEventsToStorage', function() {
    it('should remove all keys of the form prefix::events::[1-NUM_KEYS] from redis buffer', function(done) {
      step(
          function() {
            ct.EventBuffer.insertEventInBuffer({event:'pageview', 'token':'TESTING'}, this);
          },
          function() {
            ct.EventBuffer.flushEventsToStorage(this);
          },
          function() {
            ct.RC.keys(ct.EventBuffer.buildKey(['events', '*']), this);
          },
          function(err, res) {
            res.should.have.property('length');
            res.length.should.eql(0);
            done();
          }
      );
    });
  });
});