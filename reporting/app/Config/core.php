<?php
$env = getenv('CAKE_ENV');
if (!empty($env)) {
  Configure::write('App.ENV', $env);
  Configure::write('debug', 2);
  require_once(dirname(__FILE__) . '/core-' . $env . '.php');
}
else {
  Configure::write('App.ENV', 'production');
  Configure::write('debug', 0);
  require_once(dirname(__FILE__) . '/core-production.php');
}