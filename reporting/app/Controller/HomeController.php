<?php
class HomeController extends AppController {
  protected $args;
  protected $project_id;

  public $theme = 'mainevent';

  public function beforeFilter() {
    parent::beforeFilter();

    // all calls to this controller for any action will have a project name except index...
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

      if (isset($args['e'])) {
        $this->event_name = $args['e'];
      }
    }

      if(!$this->project_id && Cache::read('default_project_id')) {
          $this->project_id = Cache::read('default_project_id');
          $this->redirect(array('controller' => 'home', 'action' => 'index', 'p' => $this->project_id));
      }
  }

  public function index() {
    $this->set('activeUser', $this->current_user['username']);
    $this->set('projects', $this->getProjectsInfo());
    $this->set('timezones', ReportingAPI::getValidTimezones());
  }
}
