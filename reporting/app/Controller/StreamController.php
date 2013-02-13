<?php
class StreamController extends AppController {

  protected $args;

  protected $project_id = null;

  public $theme = 'mainevent';

  public function beforeFilter() {
    parent::beforeFilter();

    // all calls to this controller for any action will have a project name except index
    $args = array_merge($this->passedArgs, $this->request->query, $this->request->data);
    $this->args = $args;
    if (is_array($args) && is_array($this->current_user['projects'])) {
      if (isset($args['p'])) {
        if (in_array($args['p'], $this->current_user['projects'])) {
          $this->project_id = (int)$args['p'];
          $this->set('project_id', $this->project_id);
        }
        else {
          return $this->redirect(array('action'=>'index'));
        }
      }
    }
  }

  public function index() {
    $projects_info = $this->getProjectsInfo();
    $info = $projects_info[$this->project_id];

    $api = new ReportingAPI($info['api_key'], $info['api_secret'], $this->reporting_api_endpoint);

    $people = $api->getLatestPeople(array('project'=>$this->project_id));
    $this->set('people', $people);
    $this->set('api_info', array('api_key'=>$info['api_key'], 'api_secret'=>$info['api_secret'], 'project'=>$info['id'], 'endpoint'=>$this->reporting_api_endpoint));
    $this->set('projects', $projects_info);
  }
}
