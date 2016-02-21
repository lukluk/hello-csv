'use strict'
const parse = require('csv-parse')
const readline = require('readline')
const async = require('async')
const helper = require('./helper')
const fs = require('fs')

var firstLine = true
const debug = require('debug')
var _success = debug('success')
var _error = debug('error')

function sendSms(data, callback) {
  helper.sendSms(data, function(err, sendingStatus) {
    if (!err) _success('success send sms', sendingStatus)
    callback(err, {
      sendingStatus,
      data
    })
  })
}

function logS3(data, callback) {
  helper.logToS3(data, function(err, response) {
    if (!err) _success('success send log to s3', response)
    callback(err)
  })
}

function onError(err) {
  _error('error ', err)
  return new Error(err)
}

function parseAsync() {
  var rl = readline.createInterface({
    input: fs.createReadStream('./sample.csv'),
  })

  rl.on('line', function(line) {
    if (firstLine) {
      firstLine = false
      return false
    }

    async.waterfall([
      function(callback) {
        parse(line, function(err, output) {
          var transformLine = helper.mergeNameArr(output[0])
          callback(err, transformLine)
        })
      },

      sendSms,
      logS3,
    ], function(err, result) {
      if (err) _error(err.message)

    })
  })

}

parseAsync()
