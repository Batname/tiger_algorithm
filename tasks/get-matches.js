'use strict';

const gulp = require('gulp');
const co = require('co');
const _ = require('lodash');
const gutil = require('gulp-util');
const dbConnect = require('../db/connect');
const runQuery = require('../db/runQuery');
const distance = require('../lib/distance');
const distanceLimit = require('../distanceLimit');

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

      if (args.preferences) {
        collection = _.filter(collection, (row) => {
          const preferences = row.preferences.split(',');
          return _.some(preferences, _.includes.bind(null, args.preferences.split(',')));
        });
      }

      collection = _.filter(collection, (row) => {
        return distance(row.latitude, row.longitude, geoArgs[0], geoArgs[1], 'K') <= distanceLimit[args.country];
      });

      if (collection.length) {
        gutil.log(gutil.colors.magenta('!!!!!!! >>>>>>>>> HERE IS YOUR MATCHES'), collection);
      } else {
        gutil.log(gutil.colors.magenta('!!!!!!! >>>>>>>>> NO MATCHES FOUND'));
      }

      client.end();

    }).catch(function (error) {
      console.log(error)
    });
  };
};