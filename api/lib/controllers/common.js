exports.apiResponseCallback = function(response) {
  return function (err, result) {
    if (err) {
      return exports.apiError(response, err)
    }
    else {
      return exports.apiResult(response, result);
    }
  }
};

exports.apiResult = function(response, result) {
  response.json({response: result}, 200);
};

exports.apiError = function(response, err) {
  if (err == 'unauthorized') {
    response.json({error: 'unauthorized'}, 401);
  }
  else {
    if (err.constructor.name.match(/error/i)) {
      err = err.toString();
    }
    response.json({error: err}, 500);
  }
};