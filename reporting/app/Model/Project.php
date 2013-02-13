<?php
class Project extends AppModel {
    public $name = 'Project';

    protected $admin_api;
    protected $reporting_api_endpoint;
    public $useTable = false;
    public $validate = array(
        'name' => array(
            'required' => true,
                'rule' => array('notEmpty'),
                'message' => 'A project name is required'
            )
    );

    public function save() {
      if($this->validates()) {
        $admin_api_config = Configure::read('AdminAPI');
        $this->admin_api = new AdminAPI($admin_api_config);
        $reporting_api_config = Configure::read('ReportingAPI');
        $this->reporting_api_endpoint = $reporting_api_config['endpoint'];

        // If an id is set, update that project, otherwise create a new project
        if($this->id) {
          $info = $this->admin_api->getProjectInfo(array('project'=>$this->id));
          $api = new ReportingAPI($info['api_key'], $info['api_secret'], $this->reporting_api_endpoint);
          $save_result = $api->updateProject(array('project' => $this->id, 'name' => $this->data['Project']['name'], 'timezone' => $this->data['Project']['timezone']));
          if($save_result['id']) {
            return true;
          }
        }
        else {
          $save_result = $this->admin_api->addProject(array('name'=>$this->data['Project']['name'], 'timezone'=>$this->data['Project']['timezone']));
          if($save_result['id']) {
            $this->id = $save_result['id'];
            return true;
          }
        }
      }
      return false;
    }
    public function getTimeZone(){
        return ReportingAPI::getValidTimezones();

    }
}
