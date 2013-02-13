<?php
class ProjectsController extends AppController {

  protected $args;
  public $theme = 'mainevent';
  protected $project_id = null;
  protected $funnel_id = null;

  public function beforeFilter() {
    parent::beforeFilter();

    // all calls to this controller for any action will have a project name except index...
    $args = array_merge($this->passedArgs, $this->request->query, $this->request->data);
    $this->args = $args;
    if (is_array($args) && is_array($this->current_user['projects'])) {
      if (isset($args['p'])) {
        if (in_array($args['p'], $this->current_user['projects'])) {
          $this->project_id = intval($args['p']);
          $this->set('project_id', $this->project_id);
        }
        else {
          return $this->redirect(array('action'=>'index'));
        }
      }
    }
  }

  public function set_timezone() {
    if (! (isset($this->args['timezone']) && in_array($this->args['timezone'], ReportingAPI::getValidTimezones()))) {
      $response = array('error' => 'Invalid timezone');
    }
    else {
      try {
        $info = $this->admin_api->getProjectInfo(array('project'=>$this->project_id));
        $api = new ReportingAPI($info['api_key'], $info['api_secret'], $this->reporting_api_endpoint);
        $res = $api->setProjectTimezone($this->project_id, $this->args['timezone']);
        $response = array('response' => $res);
      }
      catch (Exception $e) {
        $response = array('error' => 'an error occurred');
      }
    }
    $this->autoRender = false;
    header('Content-Type: application/json');
    echo json_encode($response);
  }

  public function add() {
    if ($this->request->is('post')) {
      $project_name = $this->data["Project"]["name"];
      $timezone = $this->data["Project"]["timezone"];
      $this->Project->set(array('name'=>$project_name, 'timezone'=>$timezone));
      if($this->Project->save()){
        $user_id = $this->current_user["id"];
        $this->loadModel('UsersProject');
        $this->UsersProject->id = null;
        $this->UsersProject->set(array('project_id' => $this->Project->id, 'user_id' => $user_id));
        $this->UsersProject->save();

        // Delete projects info cache
        Cache::delete('projects_info');

        $this->Session->setFlash('The project was added.','default', array('class' => 'success'));
        $this->redirect(array('controller'=> 'home','action' => 'index', 'p'=>$this->Project->id));
      }
      else {
        $this->Session->setFlash('The project could not be added. Please, try again.');
      }
    }

    $timezones = $this->Project->getTimeZone();

    $this->set('projects', $this->getProjectsInfo());
    $this->set("timezones", array_combine($timezones, $timezones));
  }

  public function update() {
    if(empty($this->project_id)) {
      $this->redirect(array('controller' => 'events', 'action' => 'index'));
    }

    if($this->request->is('post')) {
      $this->Project->id = $this->project_id;
      $this->Project->set(array('name' => $this->data['Project']['name'], 'timezone' => $this->data['Project']['timezone_tmp']));
      if($this->Project->save()) {
        // Delete projects info cache
        Cache::delete('projects_info');

        $this->Session->setFlash('The project was saved.','default', array('class' => 'success'));
        $this->redirect(array('controller'=> 'home','action' => 'index', 'p'=>$this->project_id));
      }
      else {
        $this->Session->setFlash('The project could not be saved. Please, try again.');
      }
    }


    $projects_info = $this->getProjectsInfo();

    $this->set('project', $projects_info[$this->project_id]);
    $this->set('projects', $projects_info);
    $this->set('timezones', ReportingAPI::getValidTimezones());
  }

  public function funnels(){
    $projects_info = $this->getProjectsInfo();
    $info = $projects_info[$this->project_id];

    $project_name = $info['name'];
    $api = new ReportingAPI($info['api_key'], $info['api_secret'], $this->reporting_api_endpoint);
    $funnels = $api->getFunnels((array('project' => $this->project_id)));
    if (empty ($funnels)){
      $this->Session->setFlash(('No Funnels have been defined for this project.'));
    }
    $this->set('funnels', $funnels);
    $this->set('project_id', $this->project_id);
    $this->set('project_name', $project_name);
    $this->set('projects', $projects_info);
  }
}