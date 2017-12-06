const compileToModules = ['es2015', 'commonjs', 'amd', 'system', 'native-modules'];
const base = "./";
const paths = {
  tsConfig: base + "tsconfig.json",
  src: base + "src/",
  dist: base + "dist/"
};

const gulp = require("gulp");
const del = require('del');
const merge = require('merge2');
const runSequence = require('run-sequence');
const ts = require("gulp-typescript");

compileToModules.forEach(function (moduleType) {

  const htmlTask = 'build-html-' + moduleType;
  const tsTask = 'build-ts-' + moduleType;

  gulp.task("build-" + moduleType, function (callback) {
    runSequence([htmlTask, tsTask], callback);
  });

  gulp.task(htmlTask, function () {
    return gulp.src(paths.src + '{**/*.css,**/*.html}')
      .pipe(gulp.dest(paths.dist + moduleType));
  });

  gulp.task(tsTask, function () {

    const tsProject = ts.createProject(paths.tsConfig, {
      module: moduleType,
      target: moduleType == 'es2015' ? 'es2015' : 'es5'
    });

    const tsResult = tsProject.src().pipe(tsProject());

    return merge([
      tsResult.dts.pipe(gulp.dest(paths.dist + '/definitions')),
      tsResult.js.pipe(
        gulp.dest(paths.dist + moduleType)
      )
    ]);
  });
});

gulp.task("clean", function () {
  return del(paths.dist)
});

gulp.task('build', function (callback) {
  runSequence(
    'clean',
    compileToModules.map((moduleType) => 'build-' + moduleType),
    callback);
});