'use strict';

const fs = require('fs');
const path = require('path')

module.exports = (client, options) => {
  return new Promise((resolve, reject) => {

    function runQuery(queryString) {
      let results = [];
      const query = client.query(queryString);

      query.on('error', reject);
      query.on('row', row => results.push(row));
      query.on('end', () => resolve(results));
    }

    if (options.file) {
      fs.readFile(path.join(__dirname, 'sql', options.file), (error, data) => {
        error && reject(error);
        runQuery(data.toString());
      });
    } else if (options.string) {
      runQuery(options.string);
    } else {
      reject('you should specify file or sql string');
    }

  });
};