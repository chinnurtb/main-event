<div class="grid_3">
<?php
echo $this->Form->input('Start Date',
  array(
    'id'=>'start_date_input',
    'name'=> 'start_date',
    'class'=>'datepicker',
    'type'=>'text'
  )
);
?>
</div>
<div class="grid_3">
<?php echo $this->Form->input('End Date',
  array(
    'id'=>'end_date_input',
    'name'=> 'end_date',
    'class'=>'datepicker',
    'type'=>'text'
  )
);
?>
</div>
<div class="grid_2 suffix_4" style="height:28px; margin-top: 23px;">
  <button id="load_funnel_stats" class="btn">Get Stats</button>
</div>

<hr class="grid_12">

<div id="funnel_stats" style="display:inline-block;width: 100%;"></div>

<script>
    $(function() {
        var now = new Date();
        var firstOfThisMonth = new Date();
        firstOfThisMonth.setDate(1);
        $('.datepicker:first').val($.datepicker.formatDate('yy-mm-dd', firstOfThisMonth));
        $('.datepicker:last').val($.datepicker.formatDate('yy-mm-dd', now));
        $(".datepicker").datepicker({
            dateFormat: 'yy-mm-dd'
        });
       function loadFunnelStats() {
            var p_id = $('#select_funnel').children('option:selected').attr('p');
            var f_id = $('#select_funnel').children('option:selected').attr('f');
            var s_date = $('#start_date_input').val();
            var e_date = $('#end_date_input').val();
            $('#funnel_stats').html('<img src="/theme/mainevent/css/img/ajax-loader.gif" />');

            if(p_id && f_id) {
                $.get('/funnels/stats/', {p: p_id, f: f_id, start_date: s_date, end_date: e_date}, function(res) {
                    $('#funnel_stats').html(res);
                });
            }
            else {
                $('#funnel_stats').html('');
            }
        }
        $('#load_funnel_stats').click(function() {
            loadFunnelStats();
        });

        loadFunnelStats();

    });
</script>



