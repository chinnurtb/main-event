<div class="grid_12">
  <h1>Funnels</h1>
</div>

<hr class="grid_12">

<div class="grid_3" style="margin-top:5px;">
    <select id="select_funnel" style="float:right;">
        <option>Select a Funnel</option>
        <?php if(isset($funnels) && is_array($funnels)) { foreach ($funnels as $funnel) {?>
        <?$funnel_id = $funnel['id']; ?>
        <option <?='p="'.$project_id.'" f="'.$funnel_id.'"'; ?>><?=$this->Html->link($funnel['name'], array('controller' => 'funnels', 'action'=>'info', 'p'=>$project_id, 'f'=>$funnel['id']));?></option>
        <?php } } ?>
    </select>
</div>


<div class="grid_3 suffix_6" style="margin-top: 5px;" id="funnels_nav">
  <button class="btn btn-primary" onclick="window.location='<?= '/funnels/create/p:'.$project_id; ?>'">New Funnel</button>
  <a class="btn remove-funnel disabled" style="text-decoration: none; color: #333;">Delete Funnel</a>
</div>

<hr class="grid_12">

<div id="funnel_info" style="display:inline-block;width: 100%;"></div>

<script>
    function loadFunnelData() {
        $('#funnel_info').html('<img src="/theme/mainevent/css/img/ajax-loader.gif" />');
        var p_id = $('#select_funnel').children('option:selected').attr('p');
        var f_id = $('#select_funnel').children('option:selected').attr('f');
        if(p_id && f_id) {
            $('#funnels_nav > a.remove-funnel').attr('href', '/funnels/remove/p:'+p_id+'/f:'+f_id).removeClass('disabled');
            $.get('/funnels/info/', {p: p_id, f: f_id}, function(res) {
                $('#funnel_info').html(res);
            });
        }
        else {
            $('#funnels_nav > a.remove-funnel').addClass('disabled');

            $('#funnel_info').html('');
        }
    }
    $('#select_funnel').bind('change', function() {
        loadFunnelData();
    });
</script>



