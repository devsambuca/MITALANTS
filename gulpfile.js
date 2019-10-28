"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("gulp-autoprefixer");
const browserSync = require("browser-sync").create();
const gulpIf = require("gulp-if");
const del = require("del");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");

const isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV == "development";

sass.compiler = require("node-sass");

gulp.task("sass", function() {
  // 1. where is my scss file
  return (
    gulp
      .src("frontend/sass/**/*.sass")
      .pipe(
        plumber({
          errorHandler: notify.onError(function(err) {
            return {
              title: "sass",
              message: err.message
            };
          })
        })
      )
      .pipe(gulpIf(isDevelopment, sourcemaps.init()))
      // 2. pass that file through sass compiler
      .pipe(sass())
      .pipe(autoprefixer("last 2 version"))
      .pipe(gulpIf(isDevelopment, sourcemaps.write()))
      // 3. where do I save the compiled CSS?
      .pipe(gulp.dest("public"))
    // 4. stream changes to all browser
    // .pipe(browserSync.stream())
  );
});

gulp.task("clean", function() {
  return del("public");
});

gulp.task("assets", function() {
  return gulp
    .src("frontend/assets/**", { since: gulp.lastRun("assets") })
    .pipe(gulp.dest("public"));
});
gulp.task("build", gulp.series("clean", gulp.parallel("sass", "assets")));

gulp.task("watch", function() {
  gulp.watch("frontend/sass/**/*.*", gulp.series("sass"));
  gulp.watch("frontend/assets/**/*.*", gulp.series("assets"));
});

gulp.task("serve", function() {
  browserSync.init({
    server: "public"
  });

  browserSync.watch("public/**/*.*").on("change", browserSync.reload);
});

gulp.task("dev", gulp.series("build", gulp.parallel("watch", "serve")));
