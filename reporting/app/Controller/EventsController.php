<?php
class EventsController extends AppController {

  protected $args;
  public $theme = 'mainevent';
  protected $properties_map = array(
      '$os' => 'Operating System',
      '$browser' => 'Browser'
  );

  protected $stats_map = array(
      'stats_count' => 'Total',
      'stats_unique' => 'Uniques'
  );

  protected $date_map = array(
      'date.date' => 'Date (yyyy-mm-dd)',
      'date.month' => 'Month (yyyy-mm)',
      'date.week' => 'Week (yyyy/Wk#)',
      'date.day' => 'Weekday (Monday, ...)'
  );

  protected $custom_filter_ops = array(
      'NN' => 'IS NOT NULL',
      'NULL' => 'IS NULL',
      'EQ' => '=',
      'GT' => '>',
      'GTE' => '>=',
      'LT' => '<',
      'LTE' => '<='
  );

  const DATE_REGEX = '/^\d{4}-\d{2}-\d{2}$/';

  protected $project_id = null;
  protected $event_name = null;

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
        $this->set('event_name', $this->event_name);
      }

    }
  }

  public function view() {
    $this->layout = 'ajax';

    if (empty($this->project_id)) {
      return $this->redirect(array('action'=>'index'));
    }

      Cache::write('default_project_id', $this->project_id);

    $projects_info = $this->getProjectsInfo();
    $info = $projects_info[$this->project_id];

    $api = new ReportingAPI($info['api_key'], $info['api_secret'], $this->reporting_api_endpoint);
    // get a summary of all events
    $summaries = $api->getEventSummary(array('project'=>$this->project_id));

    $this->set('project_id', $this->project_id);
    $this->set('summaries', $summaries);
    $this->set('unique_events', array_keys($summaries));
  }

  public function details() {
    if (empty($this->project_id) || empty($this->event_name)) {
      return $this->redirect('/');
    }

    $projects_info = $this->getProjectsInfo();
    $info = $projects_info[$this->project_id];

    $api = new ReportingAPI($info['api_key'], $info['api_secret'], $this->reporting_api_endpoint);

    // to drill-down in an event, get the list of custom properties first

    $cps = $api->getCustomProperties(array('project'=>$this->project_id, 'event_name'=>$this->event_name));
    $custom_prop_list = array();
    foreach ($cps as $cp) {
      $custom_prop_list[$cp] = isset($this->properties_map[$cp]) ? $this->properties_map[$cp] : $cp;
    }

    $prop_list = array_merge($this->date_map, $custom_prop_list);

    $this->set('prop_list', $prop_list);
    $this->set('custom_prop_list', $custom_prop_list);
    $this->set('custom_filter_ops', $this->custom_filter_ops);
    $this->set('project_name', $this->project_id);
    $this->set('event_name', $this->event_name);
    $this->set('projects', $projects_info);
  }

  public function detaildata() {
    if (empty($this->project_id) || empty($this->event_name)) {
      return $this->redirect(array('action'=>'index'));
    }

    $groups = array('event');

    if (isset($this->args['props']) && is_array($this->args['props'])) {
      foreach ($this->args['props'] as $prop) {
        $groups[] = $prop;
      }
    }

    // event filter
    $filters = array('events' => array($this->event_name));
    // date filter
    if (!empty($this->args['start_date']) && !empty($this->args['end_date'])) {
      if (preg_match(self::DATE_REGEX, $this->args['start_date']) && preg_match(self::DATE_REGEX, $this->args['end_date'])) {
        $filters['date'] = array($this->args['start_date'], $this->args['end_date']);
      }
    }
    // custom filters
    $custom_filters = array();
    if (array_key_exists('custom_filters', $this->args) && is_array($this->args['custom_filters'])) {
      foreach ($this->args['custom_filters'] as $cf) {
        if (!empty($cf['field']) && !empty($cf['op']) && array_key_exists($cf['op'], $this->custom_filter_ops)) {
          if ($cf['op'] == 'EQ' && array_key_exists('values', $cf) && is_array($cf['values']) && count($cf['values']) > 0) {
            if (count($cf['values']) == 1) {
              $custom_filters[] = array('op' => '=', 'field' => $cf['field'], 'values' => $cf['values']);
            }
            else {
              $custom_filters[] = array('op' => 'in', 'field' => $cf['field'], 'values' => $cf['values']);
            }
          }
          else if ($cf['op'] == 'NULL') {
            $custom_filters[] = array('op' => 'null', 'field' => $cf['field']);
          }
          else if ($cf['op'] == 'NN') {
            $custom_filters[] = array('op' => 'notnull', 'field' => $cf['field']);
          }
          else if (!empty($cf['text'])) {
            $custom_filters[] = array('op' => $this->custom_filter_ops[$cf['op']], 'field' => $cf['field'], 'values'=>array($cf['text']));
          }
        }
      }
    }
    $filters['custom'] = $custom_filters;

    $projects_info = $this->getProjectsInfo();
    $info = $projects_info[$this->project_id];

    $api = new ReportingAPI($info['api_key'], $info['api_secret'], $this->reporting_api_endpoint);
    $res = $api->getStats(array('project'=>$this->project_id, 'spec'=>array('filters'=>$filters, 'groups'=>$groups)));

    $columns = array();
    $map = array_merge($this->properties_map, $this->date_map);
    foreach ($groups as $group) {
      if ($group != 'event') {
        $column_name = isset($map[$group]) ? $map[$group] : $group;
        $columns[$group] = $column_name;
      }
    }
    foreach ($this->stats_map as $skey=>$sname) {
      $columns[$skey] = $sname;
    }


    $this->layout = 'ajax';
    $this->set('columns', $columns);
    $this->set('data', $res);
  }
}
