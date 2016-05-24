'use strict';

const gulp = require('gulp');
const co = require('co');
const _ = require('lodash');
const gutil = require('gulp-util');
const dbConnect = require('../db/connect');
const runQuery = require('../db/runQuery');
const distance = require('../lib/distance');
const distanceLimit = require('../distanceLimit');

function _quit (client) {
  gutil.log(gutil.colors.magenta('!!!!!!! >>>>>>>>> NO MATCHES FOUND'));
  client.end();
}

function preferencesFilter(argsPreferences) {
  return (row) => {
    const preferences = row.preferences.split(',');
    return _.some(preferences, _.includes.bind(null, argsPreferences.split(',')));
  };
}

module.exports = options => {
  return function() {

    let args = require('yargs')
      .usage('gulp get-matches --country=de --geo=52.5126466,13.4154251')
      .example('gulp get-matches --country=de --geo=52.5126466,13.4154251 --gender=F --preferences=fridge')
      .describe('country', 'country code')
      .describe('geo', 'geo location')
      .demand(['country', 'geo'])
      .argv;

    if (!args.geo.split) {
      return gutil.log(gutil.colors.magenta('Whrong format of geo param'));
    }

    let geoArgs = args.geo.split(',').map(parseFloat);

    let query = 'SELECT * FROM matches';
        query += ` WHERE country_code='${args.country}'`;
        query += args.gender ? ` AND gender='${args.gender}'` : '';
        query += ';';

    return co(function*() {
      const client = yield dbConnect();

      let collection = yield runQuery(client, {string: query});
      if (!collection.length) return _quit(client);

      collection = args.preferences ? _.filter(collection, preferencesFilter(args.preferences)) : collection;
      if (!collection.length) return _quit(client);

      collection = _.filter(collection, (row) => {
        return distance(row.latitude, row.longitude, geoArgs[0], geoArgs[1], 'K') <= distanceLimit[args.country];
      });
      if (!collection.length) return _quit(client);

      gutil.log(gutil.colors.magenta('!!!!!!! >>>>>>>>> HERE IS YOUR MATCHES'), collection);
      client.end();

    }).catch(function (error) {
      console.log(error)
    });
  };
};