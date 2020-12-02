const { src, dest, series, parallel, watch } = require("gulp"),
  htmlmin = require("gulp-htmlmin"),
  webpack = require("webpack-stream"),
  sass = require("gulp-sass"),
  sourcemaps = require("gulp-sourcemaps"),
  browsersync = require("browser-sync").create(),
  gulpif = require("gulp-if"),
  rename = require("gulp-rename"),
  del = require("del"),
  responsive = require("gulp-responsive"),
  cache = require("gulp-cached");

sass.compiler = require("node-sass");

const isBuild = true,
  config = {};

(config.mode = isBuild ? "production" : "development"),
  (config.devtool = isBuild ? "none" : "eval-source-map");

function html() {
  return src("./app/index.html")
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        html5: true,
        removeComments: true,
        removeEmptyAttributes: true,
      })
    )
    .pipe(dest("./dist"));
}

function serve() {
  return browsersync.init({
    server: {
      baseDir: "./dist",
    },
  });
}

function css() {
  return src("./app/**/*.scss")
    .pipe(gulpif(!isBuild, sourcemaps.init()))
    .pipe(
      sass({
        outputStyle: "compressed",
      })
    )
    .on("error", function (error) {
      browsersync.notify(error.message, 5000);
      this.emit("end");
    })
    .pipe(gulpif(!isBuild, sourcemaps.write()))
    .pipe(
      rename({
        dirname: "",
        basename: "style",
      })
    )
    .pipe(dest("./dist"))
    .pipe(browsersync.stream());
}

function js() {
  return src("./app/**/*.js")
    .pipe(
      webpack({
        output: {
          filename: "bundle.js",
        },
        mode: config.mode,
        devtool: config.devtool,
      })
    )
    .on("error", function () {
      this.emit("end");
    })
    .pipe(dest("./dist/"));
}

function img() {
  return src("./app/imgs/*.{jpg,png}")
    .pipe(cache("image"))
    .pipe(
      responsive(
        {
          "background-*.jpg": [
            {
              width: 3840,
              rename: { suffix: "-3840" },
            },
            {
              width: 1980,
              rename: { suffix: "-1980" },
            },
          ],
          "*.jpg": [
            {
              width: 1080,
              rename: { suffix: "-1080" },
            },
            {
              width: 750,
              rename: { suffix: "-750" },
            },
            {
              width: 450,
              rename: { suffix: "-450" },
            },
          ],
          "*.png": [{}],
        },
        {
          quality: 70,
          progressive: true,
          withMetadata: false,
        }
      )
    )
    .on("error", function (error) {
      console.log(error.message);
      this.emit("end");
    })
    .pipe(dest("./dist/imgs"));
}

function font() {
  return src("./app/font/**").pipe(dest("./dist/font"));
}

function clean() {
  return del(["./dist/**"]);
}

function live() {
  watch("./app/**/*.js").on("change", series(js, browsersync.reload));
  watch("./app/index.html").on("change", series(html, browsersync.reload));
  watch("./app/**/*.scss").on("change", css);
  watch("./app/imgs/**").on("add", img);
  watch("./app/font/**").on("add", font);
}

exports.default = series(
  clean,
  parallel(html, css, js, img, font),
  parallel(live, serve)
);
