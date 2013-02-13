var step = require('step'),
  _crypto = require('crypto'),
  _nuuid = require('node-uuid'),
  _ = require('underscore');

module.exports = function (DB_API, DB_EVENT) {

  var VALID_TIMEZONES = require('./valid_timezones');

  return {
    addProject:function (options, callback) {
      if (!options.name) {
        return callback({name:'required'});
      }
      if (VALID_TIMEZONES.indexOf(options.timezone) >= 0) {
        var project_id;
        var project_token;

        step(
          function () {
            var sha_sum = _crypto.createHash('sha1');
            var token = sha_sum.update(_nuuid.v4()).digest('hex');

            sha_sum = _crypto.createHash('sha1');
            var api_key = sha_sum.update(_nuuid.v4()).digest('hex');

            sha_sum = _crypto.createHash('sha1');
            var api_secret = sha_sum.update(_nuuid.v4()).digest('hex');


            DB_API.query('INSERT INTO projects (name, timezone, token, api_key, api_secret) VALUES (?, ?, ?, ?, ?)', [options.name, options.timezone, token, api_key, api_secret], this);
          },
          function (err, res) {
            if (err) {
              return callback(err);
            }
            else if (res.insertId) {
              project_id = res.insertId;
              DB_API.query('SELECT token FROM projects WHERE id = ?', [project_id], this);
            }
            else {
              return callback('api error: insert failed');
            }
          },
          function (err, res) {
            if (err) {
              return callback(err);
            }
            if (res.length == 1 && res[0].token) {
              project_token = res[0].token;
              DB_EVENT.query('CREATE DATABASE `project_'+project_token+'`', this);
            }
            else {
              callback('api error: token error');
            }
          },
          function(err, result) {
            if(err) {
              callback('api error: database creation failed');
            }
            else {
              DB_EVENT.query('CREATE TABLE `project_' + project_token + '`.`event_log` LIKE `TEMPLATE_project`.`event_log`', this.parallel());
              DB_EVENT.query('CREATE TABLE `project_' + project_token + '`.`event_name` LIKE `TEMPLATE_project`.`event_name`', this.parallel());
              DB_EVENT.query('CREATE TABLE `project_' + project_token + '`.`event_summary` LIKE `TEMPLATE_project`.`event_summary`', this.parallel());

              DB_EVENT.query('CREATE TABLE `project_' + project_token + '`.`property_log` LIKE `TEMPLATE_project`.`property_log`', this.parallel());
              DB_EVENT.query('CREATE TABLE `project_' + project_token + '`.`property_name` LIKE `TEMPLATE_project`.`property_name`', this.parallel());
              DB_EVENT.query('CREATE TABLE `project_' + project_token + '`.`property_value` LIKE `TEMPLATE_project`.`property_value`', this.parallel());

              DB_EVENT.query('CREATE TABLE `project_' + project_token + '`.`visitor` LIKE `TEMPLATE_project`.`visitor`', this.parallel());
            }
          },
          function (err) {
            if (err) {
              return callback(err);
            }
            return callback(null, {id:project_id});
          }
        );
      }
      else {
        return callback('invalid timezone');
      }
    }
  }
};
