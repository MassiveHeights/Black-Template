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
const preprocess = require('gulp-preprocess');
const preprocessify = require('preprocessify');
const compilerPackage = require('google-closure-compiler');
const closureCompiler = compilerPackage.gulp(/* options */);
const stripDebug = require('gulp-strip-debug');

require('babel-polyfill');

let dev = false;
const cfgBrowserify = {
  cache: {},
  packageCache: {},
  debug: true,
  fullPaths: false
};

const cfgTransform = {
  'global': true,
  'only': /^(?:.*\/node_modules\/black\/|(?!.*\/node_modules\/)).*$/,
  'presets': ['es2015', 'stage-0'],
  'plugins': [
    ['babel-root-slash-import', {
      'rootPathSuffix': 'js'
    }],
    ['transform-runtime', {
      'polyfill': false,
      'regenerator': true
    }]
  ]
};

let bundler = browserify('./js/main.js', cfgBrowserify).transform(babelify, cfgTransform);

gulp.task('sheets', function () {
  return gulp.src(['./sheets/*.*'])
    .pipe(plumber())
    .pipe(gulp.dest('./dist/assets'))
    .pipe(browserSync.stream());
});

gulp.task('textures', function () {
  return gulp.src(['./textures/*.*'])
    .pipe(plumber())
    .pipe(gulp.dest('./dist/assets'))
    .pipe(browserSync.stream());
});

gulp.task('spine', function () {
  return gulp.src(['./spine/*.*'])
    .pipe(plumber())
    .pipe(gulp.dest('./dist/assets'))
    .pipe(browserSync.stream());
});

gulp.task('fonts', function () {
  return gulp.src(['./fonts/*.*'])
    .pipe(plumber())
    .pipe(gulp.dest('./dist/assets'))
    .pipe(browserSync.stream());
});

gulp.task('audio', function () {
  return gulp.src(['./audio/*.*'])
    .pipe(plumber())
    .pipe(gulp.dest('./dist/assets'))
    .pipe(browserSync.stream());
});

gulp.task('index', ['sheets'], function () {
  return gulp.src(['./html/index.html'])
    .pipe(plumber())
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.stream());
});

gulp.task('clean', function () {
  del.sync('./dist/**/*');
});

function compile() {
  let stream = null;

  if (dev) {
    stream = bundler.bundle()
      .on('error', function (err) {
        console.log(err.message);
        browserSync.notify(err.message, 3000);
        this.emit('end');
      })
      .on('end', function () { })
      .pipe(plumber())
      .pipe(source('code.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'));

    stream.on('end', x => {
      browserSync.reload({ stream: false })
    });
  } else {
    stream = gulp.src(['./js/**/*.js'], {})
      .pipe(preprocess({ context: { DEBUG: true } }))
      .pipe(sourcemaps.init())
      .pipe(closureCompiler({
        entry_point: 'main.js',
        compilation_level: 'ADVANCED', // SIMPLE, ADVANCED
        rewrite_polyfills: false,
        //warning_level: 'VERBOSE',
        language_in: 'ECMASCRIPT6_STRICT',
        language_out: 'ECMASCRIPT5_STRICT',
        output_wrapper: '(function(){\n%output%\n}).call(this);',
        js_output_file: 'code.js',
        module_resolution: 'NODE',
        dependency_mode: 'STRICT',
        extra_annotation_name: 'cat',
        jscomp_off: 'checkVars',
        js: ['node_modules/black/dist/black-es6-module.js', 'node_modules/black/package.json']
      }))
      .pipe(sourcemaps.write('/'))
      .pipe(buffer())
      .pipe(gulp.dest('./dist'));

    stream.on('end', x => {
      browserSync.reload({ stream: false })
    });
  }

  return stream;
}

gulp.task('build', ['sheets', 'textures', 'spine', 'index', 'fonts', 'audio'], function () {
  let cfg = {
    debug: true,
    ignoreWatch: ['**/node_modules/**'],
    poll: true,
    awaitWriteFinish: true
  };

  if (dev)
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

gulp.task('watch-assets', ['sheets', 'textures', 'spine', 'index', 'fonts', 'audio'], function () {
  var watcher1 = gulp.watch('./sheets/*.*', ['sheets']);
  var watcher2 = gulp.watch('./fonts/*.*', ['fonts']);
  var watcher3 = gulp.watch('./spine/*.*', ['spine']);
  var watcher4 = gulp.watch('./html/*.*', ['index']);
  var watcher5 = gulp.watch('./audio/*.*', ['audio']);
  var watcher6 = gulp.watch('./textures/*.*', ['textures']);

  watcher1.on('change', function (event) {
    console.log('Texture Atlas file ' + event.path + ' was ' + event.type + ', running tasks...');
  });

  watcher2.on('change', function (event) {
    console.log('Font file ' + event.path + ' was ' + event.type + ', running tasks...');
  });

  watcher3.on('change', function (event) {
    console.log('Spine file ' + event.path + ' was ' + event.type + ', running tasks...');
  });

  watcher4.on('change', function (event) {
    console.log('HTML file ' + event.path + ' was ' + event.type + ', running tasks...');
  });

  watcher5.on('change', function (event) {
    console.log('Audio file ' + event.path + ' was ' + event.type + ', running tasks...');
  });

  watcher6.on('change', function (event) {
    console.log('Texture file ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});

function bs() {
  let cfg = {
    server: { baseDir: './dist' },
    reloadDelay: 50,
    open: true,
    port: 4245
  };
  return browserSync(cfg);
}

gulp.task('setDev', function () {
  dev = true;

  const preprocessCfg = {
    includeExtensions: ['.js'],
    context: { DEBUG: true }
  };

  bundler = bundler.transform(preprocessify, preprocessCfg);
});

gulp.task('setProd', function () {
  dev = false;

  const preprocessCfg = {
    includeExtensions: ['.js'],
    context: {}
  };

  bundler = bundler.transform(preprocessify, preprocessCfg);
});

gulp.task('bundle', ['setProd', 'build', 'sheets', 'spine', 'index', 'fonts', 'audio']);
gulp.task('start:prod', ['setProd', 'build', 'watch-assets'], bs);
gulp.task('default', ['setDev', 'build', 'watch-assets'], bs);