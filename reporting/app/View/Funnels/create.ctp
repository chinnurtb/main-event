<?php if(count($events)) { ?>

<div class="grid_12">
  <h1>New Funnel</h1>
</div>

<hr class="grid_12">

<?= $this->Form->create(); ?>
<div class="grid_12">
  <?= $this->Form->input('name', array('type' => 'text')); ?>
</div>
<div id="events" class="grid_12">
  <?= $this->Form->input('Funnel.events.', array('type' => 'select', 'options' => array_combine($events, $events), 'label' => 'Event <span>1</span>', 'class' => 'event', 'style' => 'width:165px;')); ?>
  <div style="display: inline-block; margin: 20px 0 0;" class="event_divider">=></div>
  <?= $this->Form->input('Funnel.events.', array('type' => 'select', 'options' => array_combine($events, $events), 'label' => 'Event <span>2</span>', 'class' => 'event', 'style' => 'width:165px;')); ?>
</div>
<div class="grid_12">
  <?= $this->Form->button('Add Event', array('type' => 'button', 'id' => 'add_event', 'class' => 'btn')); ?>
</div>

<hr class="grid_12">

<div class="grid_12">
  <?= $this->Form->submit('Create', array('class' => 'btn btn-primary')); ?>
</div>
<?= $this->Form->end(); ?>

<style>
  div.input.select {
    display: inline-block;
  }
</style>

<script>
  var event_select = $('div.input.select:first').clone();

  $('#add_event').click(function() {
    var events_count = $('select.event').length;
    if(events_count < 5) {
      events_count++;
      var append_select = event_select.clone();
      var event_divider = $('div.event_divider:first').clone();
      event_divider.css('margin', '20px 4px 0');
      append_select.find('label > span').html(events_count);
      $('#events').append(event_divider, append_select);
      if(events_count == 5) {
        $(this).addClass('disabled');
      }
    }
  });
</script>
<?php } ?>