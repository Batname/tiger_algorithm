'use strict'

const gulp = require('gulp');

function lazyRequireTask(path) {
  var args = [].slice.call(arguments, 1);
  return function(callback) {
    var task = require(path).apply(this, args);

    return task(callback);
  };
}

gulp.task('db-load', lazyRequireTask('./tasks/db-load', {}));
gulp.task('get-matches', lazyRequireTask('./tasks/get-matches', {}));

gulp.task('default', ['get-matches']);