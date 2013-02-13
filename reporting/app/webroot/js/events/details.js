define(['jquery', 'jquery.dataTables','jquery-sheepit'], function($) {

  var $display, custom_filter_sheepit;

  var updateData = function(e) {
    e.preventDefault();
    var $form = $(this);
    $.get($form.attr('action'), $form.serialize(), receiveData);
    return false;
  }

  var receiveData = function(res) {
    $display.html(res);
    $display.find('table').dataTable();
  }

  var clearSubformCustomValues = function($subform) {
    $subform.find('.custom_filter_text').val('');
  }

  var setupCustomFilterSubform = function(src, $subform) {
    var $fs = $subform.find('.custom_filter_field_select');
    var $os = $subform.find('.custom_filter_op_select');
    var $vt = $subform.find('.custom_filter_vt');
    var $op = $subform.find('.custom_filter_op');
    $op.hide();
    $vt.hide();

    $fs.on('change', function() {
      var field = $fs.val();
      if (field == 0) {
        custom_filter_sheepit.removeActualForm($subform);
      }
      else {
        clearSubformCustomValues($subform);
        $op.show();
      }
    });

    $os.on('change', function() {
      $subform.find('.custom_filter_text').hide();
      $vt.show();
      clearSubformCustomValues($subform);
      var op = $os.val();
      if (op != 0 && op != 'NULL' && op != 'NN') {
        $subform.find('.custom_filter_text').show();
      }
      else {
        $vt.hide();
      }
    });
  }

  var init = function(options) {
    var $form = $(options.form);
    $display = $(options.display);

    // setup to not submit the form
    $form.submit(updateData);

    
    // dom ready
    $(function() {
      // do initial fetch of event stats
      $form.submit();

      // initialize sheepit to clone filter elements
      custom_filter_sheepit = $('#custom_filters').sheepIt({
        separator: '',
        allowAdd: true,
        maxFormsCount: 5,
        minFormsCount: 0,
        iniFormsCount: 0,
        afterAdd: setupCustomFilterSubform
      });
    });
  }

  return {init: init};
});