module.exports = function(EventBuffer, err_callback) {
  err_callback = err_callback || function () {};
  return {
    start : function() {
      (function flush_loop() {
        EventBuffer.flushEventsToStorage(function (err) {
          if (err) {
            err_callback(err);
          }
          setTimeout(flush_loop, 1000);
        });
      })();
    }
  }
};