<table class="table table-bordered">
  <thead>
    <tr>
      <?php foreach ($columns as $cname) {?>
      <th><?=Sanitize::html($cname);?></th>
      <?php }?>
    </tr>
  </thead>
  <tbody>
    <?php foreach ($data as $d) {?>
    <tr>
      <?php foreach ($columns as $ckey=>$cname) {?>
      <td><?=Sanitize::html(empty($d[$ckey]) ? 'undefined' : $d[$ckey]);?></td>
      <?php }?>
    </tr>
    <?php }?>
  </tbody>
</table>