<?php
App::uses('Controller', 'Controller');

class AppController extends Controller {

  protected $current_user;
  protected $admin_api;
  protected $reporting_api_endpoint;
  public $components = array(
      'Session',
      'Auth' => array(
          'loginRedirect' => array('controller' => 'home', 'action' => 'index'),
          'logoutRedirect' => array('controller' => 'users', 'action' => 'login')
      )
  );

  public function beforeFilter() {
    // user stuff
    $user = $this->Auth->user();
    if (is_array($user) && isset($user['id'])) {
      $this->loadModel('User', $user['id']);
      $user_data = $this->User->read(null, $user['id']);
      $this->current_user = $user_data['User'];

        $this->loadModel('UsersProject');
        $project_result = $this->UsersProject->find('all', array(
            'conditions' => array(
                'user_id' => $user['id']
           )

        ));
        $this->current_user['projects'] = array();
        foreach($project_result as $p) {
            $this->current_user['projects'][] = intval($p['UsersProject']['project_id']);
        }
    }

    App::uses('Sanitize', 'Utility');
    App::uses('ReportingAPI', 'Vendor');
    App::uses('AdminAPI', 'Vendor');

    // initialize the API
    $admin_api_config = Configure::read('AdminAPI');
    $this->admin_api = new AdminAPI($admin_api_config);

    $reporting_api_config = Configure::read('ReportingAPI');
    $this->reporting_api_endpoint = $reporting_api_config['endpoint'];
  }

  protected function getProjectsInfo() {
    $projects_info = Cache::read('projects_info');
    if(!$projects_info) {
      $projects_info = array();
      foreach ($this->current_user['projects'] as $project) {
        $projects_info[$project] = $this->admin_api->getProjectInfo(array('project'=>$project));
      }
      Cache::write('projects_info', $projects_info);
    }

    return $projects_info;
  }
}