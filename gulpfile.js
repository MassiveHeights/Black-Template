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
const preprocess = require('gulp-preprocess');
const preprocessify = require('preprocessify');
const compilerPackage = require('google-closure-compiler');
const closureCompiler = compilerPackage.gulp(/* options */);
const runSequence = require('run-sequence').use(gulp);
const stripDebug = require('./__scripts__/strip-debug');
const fs = require('fs');
const replace = require('gulp-replace');

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
const preprocessCfg = {
  includeExtensions: ['.js'],
  context: { DEBUG: true }
};

bundler = bundler.transform(preprocessify, preprocessCfg);

const defPath = './node_modules/black/package.json';
const originalPath = './node_modules/black/package-original.json';
const devPath = './node_modules/black/package-development.json';
const prodPath = './node_modules/black/package-production.json';

function preparePackages() {
  fs.copyFileSync(defPath, prodPath);
  fs.copyFileSync(defPath, devPath);
  fs.copyFileSync(defPath, originalPath);

  const dev = JSON.parse(fs.readFileSync(devPath));
  dev.env = 'development';

  const prod = JSON.parse(fs.readFileSync(prodPath));
  prod.env = 'production';
  prod.main = 'dist/gcc/black-es6-module.js';

  fs.writeFileSync(devPath, JSON.stringify(dev, null, 2));
  fs.writeFileSync(prodPath, JSON.stringify(prod, null, 2));
}

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
  del.sync('./dist/**/*.*');
});

gulp.task('development-package', function (done) {
  if (fs.existsSync(originalPath) === false)
    preparePackages();

  fs.copyFileSync(devPath, defPath);
  done();
});

gulp.task('production-package', function (done) {
  if (fs.existsSync(originalPath) === false)
    preparePackages();

  fs.copyFileSync(prodPath, defPath);
  done();
});

gulp.task('restore-package', function (done) {
  if (fs.existsSync(originalPath) === false)
    return;

  fs.copyFileSync(originalPath, defPath);
  done();
});

gulp.task('strip-debug', function () {
  return gulp.src(['./node_modules/black/dist/black-es6-module.js'], {})
    .pipe(preprocess({
      context: { /* HIDE_SPLASH_SCREEN: true */ }
    }))
    .pipe(stripDebug())
    .pipe(gulp.dest('./node_modules/black/dist/gcc/'));
});

gulp.task('compile-gcc', function () {
  return gulp.src(['./js/**/*.js'], {})
    .pipe(closureCompiler({
      externs: './externs/w3c_audio.js',
      entry_point: 'main.js',
      compilation_level: 'ADVANCED',
      rewrite_polyfills: false,
      language_in: 'ECMASCRIPT6',
      language_out: 'ECMASCRIPT5_STRICT',
      output_wrapper: '(function(){\n%output%\n}).call(this);',
      js_output_file: 'code.js',
      module_resolution: 'NODE',
      dependency_mode: 'STRICT',
      extra_annotation_name: 'cat',
      use_types_for_optimization: true,
      process_common_js_modules: false,
      generate_exports: true,
      export_local_property_definitions: true,
      js: ['./__scripts__/base.js', 'node_modules/black/dist/gcc/black-es6-module.js', 'node_modules/black/package.json'],
    }))
    .pipe(buffer())
    .pipe(gulp.dest('./dist'));
});

gulp.task('trim-gcc', function () {
  gulp.src(['./dist/code.js'])
    .pipe(replace(/configurable:!0,/g, ' '))
    .pipe(replace(/enumerable:!0,/g, ' '))
    .pipe(replace(/writable:!0,/g, ' '))    
    .pipe(gulp.dest('./dist/'));
});

function compile_babel() {
  let stream = null;

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

  return stream;
}

function bs() {
  let cfg = {
    server: { baseDir: './dist' },
    reloadDelay: 50,
    open: true,
    port: 4245
  };
  return browserSync(cfg);
}

gulp.task('watchify', function () {
  let cfg = {
    debug: true,
    ignoreWatch: ['**/node_modules/**'],
    poll: true,
    awaitWriteFinish: true
  };

  bundler = watchify(bundler, cfg);

  bundler.on('update', compile_babel);
  bundler.on('time', time => {
    gutil.log(gutil.colors.yellow(`Compiled in ${time / 1000}s`));
  });

  bundler.on('log', function (msg) {
    gutil.log(msg);
  });

  return compile_babel();
});

gulp.task('build:dev', function () {
  return runSequence('clean', ['sheets', 'textures', 'spine', 'index', 'fonts', 'audio'], 'development-package', 'watchify', bs);
});

gulp.task('build:prod', function () {
  return runSequence('clean', ['sheets', 'textures', 'spine', 'index', 'fonts', 'audio'], 'production-package', 'strip-debug', 'compile-gcc', /* 'trim-gcc',*/ 'restore-package');
});

gulp.task('watch-assets', function () {
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

gulp.task('default', ['build:dev']);