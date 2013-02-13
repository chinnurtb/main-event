<div class="grid_12">
  <table class="table table-bordered">
    <thead>
      <tr>
        <th>Order</th>
        <th>Event</th>
        <th class="right">Count</th>
        <th class="right">Percent Passed</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($event_stats as $stats) {?>
      <tr>
      <?php foreach($stats as $key => $value) { ?>
          <td<?= ($key == 'count' || $key == 'percent' ? ' class="right"' : ''); ?>><?=Sanitize::html(empty($stats[$key]) ? '--' : $stats[$key]);?></td>
          <?php } ?>
      <?php }?>
      </tr>
    </tbody>
  </table>
</div>
