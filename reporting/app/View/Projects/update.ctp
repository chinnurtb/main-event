<div class="grid_12">
  <h1>Project Settings</h1>
</div>

<hr class="grid_12">

<?= $this->Form->create('Project'); ?>
<div class="grid_12">
  <?= $this->Form->input('name', array('value' => $project['name'])); ?>
</div>
<div class="grid_12">
  <?= $this->Form->input('timezone_tmp', array('value' => $project['timezone'], 'type' => 'hidden')); ?>
  <?php //echo $this->Form->input('timezone', array('options' => array_combine($timezones, $timezones), 'default' => $project['timezone'])); ?>
</div>
<div class="grid_12">
  Token: <?= $project['token']; ?>
</div>
<div class="grid_12">
  <?php echo $this->Form->submit('Save', array('class' => 'btn btn-primary', 'style' => 'margin-top:15px;')); ?>
</div>
<?= $this->Form->end(); ?>