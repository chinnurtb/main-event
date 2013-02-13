<?php

class FunnelsController extends AppController {
  protected $project_id;
  protected $funnel_id = null;

  public $theme = 'mainevent';

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

  public function create() {

    if($this->request->is('post')) {
      $name = $this->data['Funnel']['name'];
      $events = $this->data['Funnel']['events'];

      $this->Funnel->set(array('name' => $name, 'events' => $events, 'project_id' => $this->project_id));

      if($this->Funnel->save()){
        $funnel_id = $this->Funnel->id;

        $this->Session->setFlash('The funnel was added.','default', array('class' => 'success'));
        $this->redirect(array('controller'=> 'projects', 'action' => 'funnels', 'p' => $this->project_id));
      }
      else {
        $this->Session->setFlash('The funnel could not be added. Please, try again.');
      }
    }

    $projects_info = $this->getProjectsInfo();
    $info = $projects_info[$this->project_id];

    $api = new ReportingAPI($info['api_key'], $info['api_secret'], $this->reporting_api_endpoint);
    $project_events = array_keys($api->getEventSummary(array('project' => $this->project_id)));

    if(empty($project_events)) {
      $this->Session->setFlash(('No events have been defined for this project.'));
    }

    $this->set('events', $project_events);
    $this->set('projects', $projects_info);
  }

  public function info(){
    $this->layout= "ajax";
    $projects_info = $this->getProjectsInfo();
    $info = $projects_info[$this->project_id];

    $api = new ReportingAPI($info['api_key'], $info['api_secret'], $this->reporting_api_endpoint);
    $funnels = $api->getFunnels((array('project' => $this->project_id)));
    $funnel_id = array();
    foreach($funnels as $funnel){
      $funnel_id[] = $funnel['id'];
    }
    $args = array_merge($this->passedArgs, $this->request->query, $this->request->data);
    $this->args = $args;
    if (is_array($args)) {
      if(isset($args['f'])){
        if (in_array($args['f'], $funnel_id)) {
          $this->funnel_id = intval($args['f']);
        }
        else {
          return $this->redirect(array('action'=>'funnels'));
        }
      }
    }
    $funnel_info = $api->getFunnelInfo(array('funnel'=>$this->funnel_id));
    $funnel_events = $funnel_info['events'];
    $this->set('funnel_info', $funnel_info);
    $this->set('funnel_events', $funnel_events);
    $this->set('projects', $projects_info);
  }

  public function stats(){
    $this->layout= "ajax";
    $projects_info = $this->getProjectsInfo();
    $info = $projects_info[$this->project_id];

    $api = new ReportingAPI($info['api_key'], $info['api_secret'], $this->reporting_api_endpoint);
    $funnels = $api->getFunnels((array('project' => $this->project_id)));
    $funnel_id = array();
    foreach($funnels as $funnel){
      $funnel_id[] = $funnel['id'];
    }
    $args = array_merge($this->passedArgs, $this->request->query, $this->request->data);
    $this->args = $args;
    if (is_array($args)) {
      if(isset($args['f'])){
        if (in_array($args['f'], $funnel_id)) {
          $this->funnel_id = intval($args['f']);
        }
        else {
          return $this->redirect(array('action'=>'funnels'));
        }
      }
    }
    if(empty($this->args['start_date']) || empty($this->args['end_date'])){
      $start_date = date("Y-m-d");
      $end_date = date("Y-m-d");
    }
    else{
      $start_date = $this->args['start_date'];
      $end_date = $this->args['end_date'];
    }
    $funnel_stats = $api->getFunnelStats(array('funnel'=>$this->funnel_id,'start_date'=>$start_date, 'end_date'=>$end_date ));
    $funnel_size = sizeof($funnel_stats);
    $event_count = array();
    $event_name = array();
    $event_stats = array();
    $event_percentage = array();
    foreach($funnel_stats as $stat){
      $event_count[] = $stat['num'];
    }
    if(!empty($funnel_stats)) {
      foreach($funnel_stats[$funnel_size-1] as $key => $value) {
        if(preg_match('/event/', $key)) {
          $event_name[$key] = $funnel_stats[$funnel_size-1][$key] ;
        }
      }
    }
    $event_percentage[0] = '';
    for($i=1; $i<=(sizeof($event_count)-1); $i++){
      $event_percentage[$i] = number_format((($event_count[$i]/$event_count[$i-1])*100), 2);
    }
    foreach($funnel_stats as $key => $stat){
      $funnel_stats[$key]['percent'] = $event_percentage[$key];
    }

    for($i = 0, $count=1; $i < sizeof($event_name); $i++, $count++){
      $event_stats[$i]['order'] = $count;
      $event_stats[$i]['name'] = $event_name['event_'.$i];
      $event_stats[$i]['count'] = (isset($event_count[$i]) ? $event_count[$i] : 0);
      $event_stats[$i]['percent'] = (isset($event_percentage[$i]) ? $event_percentage[$i] : '--');;
    }
    $this->set('event_stats', $event_stats);
    $this->set('funnel_stats', $funnel_stats);
    $this->set('start_date', $start_date);
    $this->set('end_date', $end_date);
    $this->set('projects', $projects_info);
  }

  public function remove() {

    $this->autoRender = false;

    $projects_info = $this->getProjectsInfo();
    $info = $projects_info[$this->project_id];

    $api = new ReportingAPI($info['api_key'], $info['api_secret'], $this->reporting_api_endpoint);
    $funnels = $api->getFunnels((array('project' => $this->project_id)));
    $funnel_id = array();
    foreach($funnels as $funnel){
      $funnel_id[] = $funnel['id'];
    }
    $args = array_merge($this->passedArgs, $this->request->query, $this->request->data);
    $this->args = $args;
    if (is_array($args)) {
      if(isset($args['f'])){
        if (in_array($args['f'], $funnel_id)) {
          $this->funnel_id = intval($args['f']);
        }
        else {
          return $this->redirect(array('action'=>'funnels'));
        }
      }
    }
    if($api->removeFunnel(array('project'=>$this->project_id,'funnel'=>$this->funnel_id))){
      $this->Session->setFlash('The funnel was deleted.','default', array('class' => 'success'));
      $this->redirect(array('controller'=> 'projects', 'action' => 'funnels', 'p' => $this->project_id));
    }
    else{
      $this->Session->setFlash('The funnel could not be deleted. Please, try again.');
    }

    $this->set('projects', $projects_info);
  }
}
