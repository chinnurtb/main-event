define(['jquery'], function($) {
  var ProjectTimezone = function(options) {
    this.options = options;
  }

  ProjectTimezone.prototype.init = function() {
    var options = this.options;
    if (!(options.cname && options.url && options.timezones)) {
      throw 'project-timezone requires options.cname,options.url,options.timezones';
    }
    var url = options.url;

    // initialize timezone picker
    var tz_html = '<select id="project-timezone-picker">';
    var nr = options.timezones.length; var tz;
    for (var i = 0; i < nr; i++) {
      tz = options.timezones[i].replace(/[^\w\d_\/-]/i, '');
      tz_html += '<option value="' + tz + '">' + tz + '</option>';
    }
    tz_html += '</select>'

    var $tz_picker = $(tz_html);

    var initTzEdit = function(el) {
      var $el = $(el);
      $el.wrap('<div class="project-timezone-wrapper">');
      $el.click(function(e) {
        e.preventDefault();
        $el.hide();
        $tz_picker.val($el.text());
        $tz_picker.appendTo($el.parent()).show();
        $tz_picker.focus();
        $tz_picker.blur(function() {
          $tz_picker.off('blur');
          $tz_picker.off('change');
          $tz_picker.off('keydown');
          $tz_picker.hide();
          $el.show();
        });
        $tz_picker.keydown(function(e) {
          if (e.keyCode == 27) {
            $tz_picker.blur();
          }
        });
        $tz_picker.change(function() {
          var new_val = $tz_picker.val();
          var prid = $el.data('id');
          $.post(url, {p: prid, timezone: new_val}, function(res) {
            if (res.response && res.response == 'OK') {
              $el.text(new_val);
            }
          }, 'json');
          $tz_picker.blur();
          return false;
        });
      });
    }

    $(function() {
      var $tzedits = $('.' + options.cname);
      $tzedits.each(function() {
        initTzEdit(this);
      });
    });
  }

  return ProjectTimezone;
});