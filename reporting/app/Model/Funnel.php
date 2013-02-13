<?php

class Funnel extends AppModel {
  public $name = 'Funnel';

  protected $api;
  public $useTable = false;
  public $validate = array(
    'name' => array(
      'required' => true,
      'rule' => array('notEmpty'),
      'message' => 'A funnel name is required'
    ),
    'events' => array(
      'rule' => array('event_count', 2, 5),
      'message' => array('Please select two to five events')
    )
  );

  public function save() {
    if($this->validates()) {
    $admin_api_config = Configure::read('AdminAPI');
    $admin_api = new AdminAPI($admin_api_config);

    $reporting_api_config = Configure::read('ReportingAPI');
    $reporting_api_endpoint = $reporting_api_config['endpoint'];

    $info = $admin_api->getProjectInfo(array('project'=>$this->data['Funnel']['project_id']));
    $reporting_api = new ReportingAPI($info['api_key'], $info['api_secret'], $reporting_api_endpoint);
      $save_result = $reporting_api->addFunnel(array('name' => $this->data['Funnel']['name'], 'events' => $this->data['Funnel']['events'], 'project' => $this->data['Funnel']['project_id']));
      if($save_result['id']) {
        $this->id = $save_result['id'];
        return true;
      }
    }
    return false;
  }

  public function event_count($check, $min, $max) {
    if(count($check['events']) >= $min && count($check['events']) <= $max) {
      return true;
    }
    return false;
  }
}
