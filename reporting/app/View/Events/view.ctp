<div class="grid_12">
  <h1>Dashboard</h1>
</div>
<div class="grid_12">
  <table id="summary" class="tablesorter table table-bordered" style="margin-top: 20px;">
    <thead>
    <tr>
      <th>Event</th>
      <th class="right">Today</th>
      <th class="right">Yesterday</th>
      <th class="right">This Week</th>
      <th class="right">Last Week</th>
      <th class="right">30 days</th>
      <th class="right">This Month</th>
      <th class="right">All Time</th>
    </tr>
    </thead>
    <tbody>
    <?php

    $totals = array('today' => 0, 'yesterday' => 0, 'this_week' => 0, 'last_week' => 0, 'last_30' => 0, 'mtd' => 0, 'itd' => 0);

    foreach ($summaries as $event_name=>$summary) {
      ?>
    <tr>
      <td><?=$this->Html->link($event_name, array('controller' => 'events', 'action'=>'details', 'p'=>$project_id, 'e'=>$event_name));?></td>
      <?php
      foreach (array('today', 'yesterday', 'this_week', 'last_week', 'last_30', 'mtd', 'itd') as $stat) {
        $totals[$stat] += $summary[$stat];
        ?>
        <td class="right"><?=Sanitize::html(number_format($summary[$stat]));?></td>
        <?php }?>
    </tr>
      <?php } ?>
    </tbody>
    <tfoot>
    <tr>
      <td><b>Totals</b></td>
      <?php foreach($totals as $val) { ?>
      <td class="right"><b><?= Sanitize::html(number_format($val)); ?></b></td>
      <?php } ?>
    </tr>
    </tfoot>
  </table>
</div>

<!--<script>

    $(document).ready(function()
        {
            $("#summary").tablesorter();
        }
    );

    // Return a helper with preserved width of cells
    var fixHelper = function(e, ui) {
        ui.children().each(function() {
            $(this).width($(this).width());
        });
        return ui;
    };

    $("#summary tbody").sortable({
        helper: fixHelper,
        stop: function(event, ui) {
            console.log(event);
        }
    }).disableSelection();


</script>-->