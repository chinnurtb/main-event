define(['reporting-api', 'jquery', 'underscore'], function(ReportingAPI, $, _) {

  var REAL_TIME_SECONDS = 3;

  var person_template = _.template($('#person-view-template').html());
  var stream_template = _.template($('#stream-view-template').html());

  var PersonView = function(person_id) {
    this.person_id = person_id;
    this.events = [];
    this.last_seen = '';
    this.$el = $(person_template(this));
  }

  PersonView.prototype.addEvent = function(event) {
    var num_events = this.events.length, cevent;
    for (var i = 0; i < num_events; i++) {
      cevent = this.events[i];
      // check if we're adding  the same event...
      if (cevent.event == event.event && cevent.ts_epoch == event.ts_epoch) {
        return false;
      }
    }
    this.events.push(event);
    this.events.sort(function(a, b) {
      return b.ts_epoch - a.ts_epoch;
    });
    this.last_seen = this.getLastSeen();
  }

  PersonView.prototype.getLastSeen = function() {
    if (this.events.length == 0) {
      return 0;
    }
    else {
      return this.events[0].ts;
    }
  }

  PersonView.prototype.getLatestTimestamp = function() {
    if (this.events.length == 0) {
      return 0;
    }
    else {
      return this.events[0].ts_epoch;
    }
  }

  PersonView.prototype.render = function() {
    return person_template(this);
  }

  var StreamView = function(options) {
    this.options = options;
  }

  // "private" functions, to call with processXXX.call(this, xxx)
  var processEvents = function(events) {
    var num_events = events.length, event;
    for (var i = 0; i < num_events; i++) {
      event = events[i];
      var person = event.name_tag || 'Guest ' + event.distinct_id;
      delete(event.name_tag);
      delete(event.distinct_id);
      addEventToPerson.call(this, event, person);
    }
    this.$container.html(this.render());
  }

  var processPeople = function(people) {
    
  }

  var addEventToPerson = function(event, person) {
    var person_obj;
    if (!this.people[person]) {
      this.people[person] = person_obj = new PersonView(person);
    }
    this.people[person].addEvent(event);
  }

  StreamView.prototype.init = function() {
    var that = this;
    this.$view = $(this.options.container);
    this.$container = $('<div>').appendTo(this.$view);
    this.api = new ReportingAPI(this.options.api_info);

    this.real_time = false;
    this.people = [];

    // actions
    this.$view.find('.realtime_toggle').click(function(e) {
      e.preventDefault();
      that.toggleRealtime();
      return false;
    });

    this.$view.find('.more_data').click(function(e) {
      e.preventDefault();
      that.loadSomeData();
      return false;
    });

    // process initial data
    if (this.options.people) {
      processPeople.call(this, this.options.people);
    }
  }

  StreamView.prototype.toggleRealtime = function() {
    this.real_time = !this.real_time;
    if (this.real_time) {
      this.loadSomeData();
    }
  }

  StreamView.prototype.loadSomeData = function() {
    if (this.loading_some_data) {
      return false;
    }
    this.loading_some_data = true;
    var that = this;
    this.api.getLatestEvents({project: this.options.api_info.project}, function(data) {
      processEvents.call(that, data);
      that.loading_some_data = false;
      if (that.real_time) {
        setTimeout(that.loadSomeData.bind(that), REAL_TIME_SECONDS * 1000);
      }
    });
    return false;
  }

  StreamView.prototype.render = function() {
    var sorted_people = [];
    for (var i in this.people) {
      if (this.people.hasOwnProperty(i)) {
        sorted_people.push(this.people[i]);
      }
    }
    sorted_people.sort(function(a,b) {
      return b.getLatestTimestamp() - a.getLatestTimestamp();
    });
    return stream_template({people: sorted_people});
  }

  return StreamView;
});