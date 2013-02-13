<div class="grid_12">
  <h1>Add Project</h1>
</div>

<hr class="grid_12">

<?php echo $this->Form->create('Project'); ?>
<div class="grid_12">
  <?php echo $this->Form->input('name'); ?>
</div>
<div class="grid_12">
  <?php echo $this->Form->input('timezone',array('type' => 'select','options' => $timezones)); ?>
</div>
<div class="grid_12">
  <?php echo $this->Form->submit('Add Project', array('class' => 'btn btn-primary', 'style' => 'margin-top:15px;')); ?>
</div>
<?php echo $this->Form->end();?>