<script>

  function loadProjectData() {
    $('#content').html('<div class="grid_12"><img src="/theme/mainevent/css/img/ajax-loader.gif" /></div>');
    var p_id = parseInt($('#select_project').children('option:selected').val(), 10);
    if(p_id) {
      $.get('/events/view', {p: p_id}, function(res) {
        $('#content').html(res);
      });
    }
    else {
      $('#content').html('');
    }
  }

  // On load check if a project is selected
  loadProjectData();

</script>