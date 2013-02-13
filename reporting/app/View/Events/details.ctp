<div class="grid_12">
  <h1>Action Details: <?=Sanitize::html($event_name);?></h1>
</div>

<hr class="grid_12">

<div class="grid_12">
  <h2>View Events By</h2>
</div>

<form id="details_form" action="<?=$this->Html->url(array('action'=>'detaildata', 'e'=>$event_name, 'p'=>$project_name));?>" method="get">
  <div class="grid_12">
    <ul style="list-style: none; margin:0;">
    <?php foreach ($prop_list as $key=>$name) {?>
      <li style="display:inline-block; margin-right: 10px;">
        <label>
          <input<?=$key=='date.date' ? ' checked="checked"':'';?> type="checkbox" name="props[]" value="<?=Sanitize::html($key);?>" style="display: inline;">
          <?=Sanitize::html($name);?>
        </label>
      </li>
    <?php }?>
    </ul>
  </div>

  <hr class="grid_12">

  <div class="grid_12">
    <h2>Filter by Date</h2>
  </div>

  <script>
  $(function() {
         $(".datepicker").datepicker(({ dateFormat: 'yy-mm-dd' }));
  });

  </script>

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
  <div class="grid_3 suffix_6">
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

  <hr class="grid_12">

  <div class="grid_12">
    <h2>Filter by Custom</h2>
  </div>

  <div class="grid_12">
    <!-- SHEEPIT :: custom_filter -->
    <ul id="custom_filters">
      <!-- TEMPLATE :: custom_filter -->
      <li id="custom_filters_template">
        <div class="custom_filter_cpt">
          <label for="custom_filters[#index#][field]">field</label>
          <select class="custom_filter_field_select" id="custom_filter_field_#index#" name="custom_filters[#index#][field]">
            <option value="">-</option>
            <?php foreach ($custom_prop_list as $key=>$name) {?>
            <option value="<?=Sanitize::html($key);?>"><?=Sanitize::html($name);?></option>
            <?php }?>
          </select>
        </div>
        <div class="custom_filter_cpt custom_filter_op">
          <label for="custom_filter[#index#][op]">operation</label>
          <select class="custom_filter_op_select" name="custom_filters[#index#][op]" id="custom_filter_op_#index#">
          <?php foreach ($custom_filter_ops as $key=>$op) {?>
            <option value="<?=Sanitize::html($key);?>"><?=Sanitize::html($op);?></option>
          <?php }?>
          </select>
        </div>
        <div class="custom_filter_cpt custom_filter_vt">
          <label>value(s)</label>
          <div class="custom_filter_text">
            <input type="text" id="custom_filter_text_#index#" name="custom_filters[#index#][text]">
          </div>
        </div>


        <a id="custom_filters_remove_current">remove</a>
      </li>
      <!-- /TEMPLATE :: custom_filter -->

      <li id="custom_filters_noforms_template">no filter</li>
      <li id="custom_filters_controls">
        <a id="custom_filters_add">add filter</a>
      </li>
    </ul>
    <!-- /SHEEPIT :: custom_filter -->
  </div>

  <hr class="grid_12">

  <div class="grid_12">
    <button type="submit" class="btn btn-primary">Update Data</button>
  </div>
</form>

<hr class="grid_12">

<div class="grid_12">
  <h2>Results</h2>
</div>

<div id="details_data" class="grid_12"><img src="/theme/mainevent/css/img/ajax-loader.gif" alt="Loading"/></div>

<style>
  div.dataTables_length {
    float: left;
  }
  div.dataTables_length select {
    margin-top: 7px;
  }
  div.dataTables_filter {
    float: right;
    text-align: right;
  }
  div.dataTables_length select, div.dataTables_filter input {
    display: inline;
  }
  div.dataTables_info {
    float: left;
  }
  div.dataTables_paginate {
    float: right;
  }
  div.dataTables_paginate > a {
    margin-left: 15px;
  }
</style>

<script>
  require(['events/details'], function(app) {
    app.init({
      form: '#details_form',
      display: '#details_data'
    });
  });
</script>
