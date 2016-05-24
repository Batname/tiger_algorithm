'use strict';

const pg = require('pg');
const conString = "postgres://denisdubinin:@localhost/tiger";

module.exports = () => {
  return new Promise((resolve, reject) => {
    pg.connect(conString, (err, client, done) => {
      if(err) {
        reject('error fetching client from pool');
      }

      resolve(client);
    });
  });
}