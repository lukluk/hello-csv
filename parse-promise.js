'use strict';
const parse = require('csv-parse');
const readline = require('readline');
const helper = require('./helper');
const fs = require('fs');

var firstLine = true;
const debug = require('debug');
var _success = debug('success');
var _error = debug('error');

function sendSms(data) {
  return new Promise(function(success, error) {
    helper.sendSms(data, function(err, sendingStatus) {
      if (err) error(err);
      else {
        _success('success send sms', sendingStatus)
        success({
          sendingStatus,
          data
        })
      }
    })
  })
}

function logS3(data) {
  return new Promise(function(success, error) {
    helper.logToS3(data, function(err, response) {
      if (err) error(err);
      else {
        _success('success send log to s3', response)
        success(response)
      }
    })
  })

}

function parseCsv(line) {
  return new Promise(function(success, error) {
    parse(line, function(err, output) {
      if (err) error(err);
      else success(line, output[0])
    })
  })
}

function onError(err) {
  _error('error ', err)
  return new Error(err)
}

function parsePromise() {
  var rl = readline.createInterface({
    input: fs.createReadStream('./sample.csv'),
  });

  rl.on('line', function(line) {
    if (firstLine) {
      firstLine = false;
      return false;
    }

    var transformLine = helper.mergeNameStr(line)
    parseCsv(transformLine).then(sendSms).then(logS3).catch(onError)
  })

}

parsePromise()
