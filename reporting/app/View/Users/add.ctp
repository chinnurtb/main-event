<div class="grid_12">
  <h1>Add User</h1>
</div>

<hr class="grid_12">

<?php echo $this->Form->create('User');?>

<div class="grid_12">
  <?php echo $this->Form->input('username'); ?>
</div>
<div class="grid_12">
  <?php echo $this->Form->input('password'); ?>
</div>
<div class="grid_12">
  <?php echo $this->Form->input('role', array('options' => array('admin' => 'Admin', 'author' => 'Author'))); ?>
</div>
<div class="grid_12">
  <?php echo $this->Form->submit('Add User', array('class' => 'btn btn-primary')); ?>
</div>

<?php echo $this->Form->end();?>