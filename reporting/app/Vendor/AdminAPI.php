<?php
class AdminAPI {

  protected $app_key;
  protected $app_cert;
  protected $endpoint;
  protected $insecure;

  public function __construct(array $config) {
    if (isset($config['app_key']) && isset($config['app_cert']) && isset($config['endpoint'])) {
      $this->app_key = $config['app_key'];
      $this->app_cert = $config['app_cert'];
      $this->endpoint = $config['endpoint'];
      $this->insecure = !isset($config['secure']) || (bool)$config['secure'] === true;
    }
    else {
      throw new Exception('Bad configuration. Missing app_key, app_cert or endpoint');
    }
  }
  public function addProject($options){
    return $this->runRequest('/add_project', $options, true);
  }

  public function getProjectInfo($options) {
    $res = $this->runRequest('/project_info', $options);
    return $res;
  }
  
  protected function runUpdate($path, array $params) {
    return $this->runRequest($path, $params, true);
  }

  protected function runRequest($path, array $params, $post = false) {
    error_log('AdminAPI::runRequest - '.print_r(array('path' => $path, 'params' => $params), true));

    $qs = urlencode(base64_encode(json_encode($params)));

    if ($post) {
      $ch = curl_init($this->endpoint . $path);
      curl_setopt($ch, CURLOPT_POSTFIELDS, $qs);
    }
    else {
      $ch = curl_init($this->endpoint . $path . '?' . $qs);
    }
    curl_setopt($ch, CURLOPT_SSLCERT, $this->app_cert);
    curl_setopt($ch, CURLOPT_SSLKEY, $this->app_key);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

    if ($this->insecure) {
      curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
      curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    }
    $json_res = curl_exec($ch);

    if (curl_errno($ch) > 0) {
      throw new Exception(curl_error($ch) . print_r(curl_getinfo($ch), true));
    }

    $res = json_decode($json_res, true);

    if (empty($res)) {
      throw new Exception('API error >> ' . $json_res);
    }
    else if (isset($res['error'])) {
      if (is_array($res['error'])) {
        $error_messages = array();
        foreach ($res['error'] as $err) {
          if (is_string($err)) {
            $error_messages[] = $err;
          }
          else if (is_array($err) && isset($err['param']) && isset($err['msg']) && isset($err['value'])) {
            $error_messages[] = 'Validation error >>> (' . $err['param'] . ' = ' . $err['value']. '): ' . $err['msg'];
          }
          else {
            $error_messages[] = json_encode($err);
          }
        }
        throw new Exception(implode($error_messages, "\n\n"));
      }
      else {
        throw new Exception('API error >>> ' . $res['error']);
      }
    }
    else if (isset($res['response'])) {
      return $res['response'];
    }
    else {
      throw new Exception("API error >>> invalid response:\n\n" . $json_res);
    }
  }
}