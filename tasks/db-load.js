'use strict';

const gulp = require('gulp');
const co = require('co');
const dbConnect = require('../db/connect');
const runQuery = require('../db/runQuery');

module.exports = options => {
  return function() {

    return co(function*() {
      const client = yield dbConnect();
      yield runQuery(client, {string: 'DROP TABLE IF EXISTS matches;'});
      yield runQuery(client, {file: 'create-table.sql'});
      yield runQuery(client, {file: 'seeds.sql'});
      client.end();

    }).catch(function (error) {
      console.log(error)
    });
  };
};