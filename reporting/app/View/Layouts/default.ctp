<!doctype html>
<html>
<head>
	<?=$this->Html->charset();?>
	<title>
		<?=$title_for_layout;?>
	</title>
	<?php
  echo $this->Html->meta('icon');

  echo $this->Html->css('960');
  echo $this->Html->css('bootstrap');
  echo $this->Html->css('jquery-ui');
  echo $this->Html->css('mainevent');
//  echo $this->Html->css('tablesorter');


?>
<script>
  var require = {baseUrl: '/js'};
</script>
<?php
  echo $this->Html->script('require-jquery');
  echo $this->Html->script('jquery');
  echo $this->Html->script('jquery-ui');
//  echo $this->Html->script('jquery.tablesorter');
  echo $this->Html->script('bootstrap.min');

  echo $this->fetch('meta');
  echo $this->fetch('css');
  echo $this->fetch('script');
?>


</head>
<body>

<?php if($this->Session->check('Auth.User.id')){?>
<div id="wrapper">
    <?php echo $this->Session->flash(); ?>
    <div id="header-leather"></div>
    <div class="container_12 header" style="height: 53px;">
      <div class="grid_2">
        <a href="/"><div id="logo" style="margin-top: 14px;"></div></a>
      </div>
      <div class="grid_3" style="margin-top: 13px;">
        <select id="select_project" style="float:left;">
          <option>Select a Project</option>
          <?php if(isset($projects) && is_array($projects)) { foreach ($projects as $project) {?>
          <option value="<?= $project['id']; ?>"<?= isset($project_id) && $project_id == $project['id'] ? 'selected="selected"' : '' ?>><?=$this->Html->link($project['name'], array('controller' => 'events', 'action'=>'view', 'p'=>$project['id']));?> (<?=Sanitize::html($project['timezone']);?>)</option>
          <?php } } ?>
        </select>
      </div>
      <div class="grid_3">
        <p style="color: #ffffff; margin-top:18px; float:left;">- or -</p>
        <a class="btn btn-danger btn-small" href="/projects/add" style="margin-top: 13px; float right; margin-left: 18px;">Add Project</a>
      </div>

      <div class="grid_3" style="margin-top:10px; float: right;">
        <ul class="nav nav-pills" style="float:right; margin:0;">
          <li><a href="#">Account</a></li>
          <li><a href="#">Help</a></li>
          <li><a href="/users/logout">Logout</a></li>
        </ul>
      </div>
    </div>

    <div id="header-linen"></div>
    <div class="container_12" style="height: 46px;">
        <div class="btn-group grid_5" style="margin-top: 9px;" id="project_nav">
            <a class="btn dashboard<?php
                echo isset($project_id) ? '' : ' disabled';
                echo ($this->params['controller'] == 'home' && $this->params['action'] == 'index') ? ' active' : '';
            ?>" <?= isset($project_id) ? 'href="/home/index/p:'.$project_id.'"' : '';?>>Dashboard</a>

            <a class="btn funnels<?php
                echo isset($project_id) ? '' : ' disabled';
                echo ($this->params['controller'] == 'projects' && $this->params['action'] == 'funnels') ? ' active' : '';
                ?>" <?= isset($project_id) ? 'href="/projects/funnels/p:'.$project_id.'"' : ''; ?>>Funnels</a>

            <a class="btn stream<?php
                echo isset($project_id) ? '' : ' disabled';
                echo ($this->params['controller'] == 'stream' && $this->params['action'] == 'index') ? ' active' : '';
                ?>" <?= isset($project_id) ? 'href="/stream/index/p:'.$project_id.'"' : ''; ?>>Stream</a>

            <a class="btn settings<?php
                echo isset($project_id) ? '' : ' disabled';
                echo ($this->params['controller'] == 'projects' && $this->params['action'] == 'update') ? ' active' : '';
                ?>" <?= isset($project_id) ? 'href="/projects/update/p:'.$project_id.'"' : ''; ?>>Settings</a>

        </div>
    </div>
        <?php } else {?>


    <div id="header-leather"></div>
    <div class="container_12 header" style="height: 53px;">
        <div class="grid_2">
            <a href="/"><div id="logo" style="margin-top: 14px;"></div></a>
        </div>
    </div>
    <div id="header-linen"></div>
    <div class="container_12" style="height: 46px;"></div>


     <?}?>

    <div id="container" class="container_12">
        <div id="content" style ="margin-top: 50px; margin-bottom: 25px;" >
            <?php echo $this->fetch('content'); ?>
        </div>
    </div>

    <div id="footer">
      <div class="container_12">
        <div class="grid_1 prefix_9" style="position: relative; height:40px;">
          <a href="http://www.mainevent.io" style="height:100%; width:100%;"><div id="main-logo"></div></a>
        </div>
        <div class="grid_2" style="position: relative;">
          <a href="http://www.playerize.com" style="height:100%; width:100%;"><div id="powered-logo"></div></a>
        </div>
      </div>
    </div>
  </div>

  <script>
    $(function() {
      if($('#flashMessage').css('display') != 'none') {
        var t_o = setTimeout("$('#flashMessage').hide('fade', 1000)", 2500);
      }

      $('#flashMessage').click(function() {
        $(this).hide('fade', 1000);
      });

      $('#select_project').bind('change', function() {
        var p_id = parseInt($('#select_project').children('option:selected').val(), 10);
        if(p_id) {
          top.window.location = '/home/index/p:'+p_id;
        }
        else {
          top.window.location = '/';
        }
      });
    });
  </script>
</body>
</html>
