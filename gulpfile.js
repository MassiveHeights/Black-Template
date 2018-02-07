const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');
const babelify = require('babelify');
const browserSync = require('browser-sync');
const plumber = require('gulp-plumber');
const del = require('del');
const gutil = require('gulp-util');
const uglify = require('gulp-uglify');
const preprocessify = require('preprocessify');
require("babel-polyfill");

const cfgBrowserify = {
  cache: {},
  packageCache: {},
  debug: true,
  fullPaths: false
};

const cfgTransform = {
  'presets': ['es2015', 'stage-0'],
  'plugins': [
    ["babel-root-slash-import", {
      "rootPathSuffix": "js"
    }],
    ['transform-runtime', {
      'polyfill': true,
      'regenerator': false
    }]
  ]
};

let bundler = browserify('./js/main.js', cfgBrowserify)
  .transform(babelify, cfgTransform);

gulp.task('assets', function () {
  return gulp.src(['./assets/*.*'])
    .pipe(plumber())
    .pipe(gulp.dest('./dist/assets'))
    .pipe(browserSync.stream());
});


gulp.task('clean', function () {
  del.sync('./dist/**/*');
});

function compile() {
  let stream = null;

  stream = bundler.bundle()
    .on('error', function (err) {
      console.log(err.message);
      browserSync.notify(err.message, 3000);
      this.emit('end');
    })
    .on('end', function () {

    })
    .pipe(plumber())
    .pipe(source('code.js'))
    .pipe(buffer())
    //.pipe(uglify())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'));

  stream.on('end', x => {
    browserSync.reload({stream: false})
  });

  return stream;
}

gulp.task('build', ['assets'], function () {
  let cfg = {
    debug: true,
    ignoreWatch: ['**/node_modules/**'],
    poll: true,
    awaitWriteFinish: true
  };

  bundler = watchify(bundler, cfg);

  bundler.on('update', compile);
  bundler.on('time', time => {
    gutil.log(gutil.colors.yellow(`Compiled in ${time / 1000}s`));
  });

  bundler.on('log', function (msg) {
    gutil.log(msg);
  });

  return compile();
});

gulp.task('watch-media', ['assets'], function () {
  var watcher1 = gulp.watch('./assets/*.*', ['assets']);

  watcher1.on('change', function (event) {
    console.log('Asset file ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});

function bs() {
  let cfg = {
    server: { baseDir: './dist' },
    reloadDelay: 0,
    open: false
  };
  return browserSync(cfg);
}

gulp.task('bundle', ['build', 'assets']);
gulp.task('default', ['build', 'watch-media'], bs);