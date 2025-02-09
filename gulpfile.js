const gulp = require("gulp");
const gulpIf = require("gulp-if");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass")(require("sass"));
const htmlmin = require("gulp-htmlmin");
const cssmin = require("gulp-cssmin");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");
const jsImport = require("gulp-js-import");
const sourcemaps = require("gulp-sourcemaps");
const htmlPartial = require("gulp-html-partial");
const fileInclude = require("gulp-file-include");
const clean = require("gulp-clean");
const cssbeautify = require("gulp-cssbeautify");
const htmlbeautify = require("gulp-html-beautify");
const postcss = require("gulp-postcss");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const notify = require("gulp-notify");
const isProd = process.env.NODE_ENV === "prod";

const htmlFile = ["src/*.html", "!src/partials/**"];

const html = () => {
  return gulp
    .src(htmlFile)
    .pipe(
      fileInclude({
        prefix: "@@",
        basepath: "src/partials/",
      })
    )
    .pipe(htmlbeautify())
    .on(
      "error",
      notify.onError({
        title: "HTML Error",
        message: "<%= error.message %>",
      })
    )
    .pipe(
      gulpIf(
        isProd,
        htmlmin({
          collapseWhitespace: true,
        })
      )
    )
    .pipe(gulp.dest("public"));
};

const css = () => {
  return gulp
    .src("src/assets/css/style.css")
    .pipe(postcss([tailwindcss("./tailwind.config.js"), autoprefixer()]))
    .on(
      "error",
      notify.onError({
        title: "CSS Error",
        message: "<%= error.message %>",
      })
    )
    .pipe(gulpIf(isProd, cssmin()))
    .pipe(gulp.dest("public/assets/css/"));
};

const js = () => {
  return (
    gulp
      .src("src/assets/js/*.js")
      .pipe(
        jsImport({
          hideConsole: true,
        })
      )
      // .pipe(concat('all.js'))
      .pipe(gulpIf(isProd, uglify()))
      .pipe(gulp.dest("public/assets/js"))
  );
};

const img = () => {
  return gulp
    .src("src/assets/img/*")
    .pipe(gulpIf(isProd, imagemin()))
    .pipe(gulp.dest("public/assets/img/"));
};

const fonts = () => {
  return gulp
    .src("src/assets/fonts/*.{eot,svg,ttf,woff,woff2}")
    .pipe(gulp.dest("public/assets/fonts/"));
};

const serve = (done) => {
  browserSync.init({
    open: true,
    notify: false,
    port: 3000,
    server: "./public", // Pastikan folder public yang dilayani
  });
  done();
};

const browserSyncReload = (done) => {
  browserSync.reload(); // Memastikan halaman di-refresh
  done();
};

const icons = () => {
  return gulp
    .src("./node_modules/phosphor-icons/**/*")
    .pipe(gulp.dest("public/assets/vendor/icons/"));
};

const swiper = () => {
  return gulp
    .src("./node_modules/swiper/**")
    .pipe(gulp.dest("public/assets/vendor/swiper/"));
};

const datepicker = () => {
  return gulp
    .src("./node_modules/flatpickr/dist/**")
    .pipe(gulp.dest("public/assets/vendor/flatpickr"));
};

const watchFiles = () => {
  gulp.watch("src/**/*.html", gulp.series(html, css, browserSyncReload));
  gulp.watch("src/assets/**/*.css", gulp.series(css, browserSyncReload));
  gulp.watch("src/assets/**/*.js", gulp.series(js, browserSyncReload));
  gulp.watch("src/assets/img/**/*.*", gulp.series(img));
  gulp.watch("src/assets/**/*.{eot,svg,ttf,woff,woff2}", gulp.series(fonts));
  gulp.watch("src/assets/vendor/**/*.*", gulp.series(icons));
  gulp.watch("src/assets/vendor/swiper/**/*.*", gulp.series(swiper));
  gulp.watch("src/assets/vendor/**/*.*", gulp.series(datepicker));
};

const del = () => {
  return gulp.src("public/*", { read: false }).pipe(clean());
};

// Task exports
exports.css = css;
exports.html = html;
exports.js = js;
exports.fonts = fonts;
exports.del = del;

// Vendors
exports.icons = icons;
exports.swiper = swiper;
exports.datepicker = datepicker;

// Serve task (menggabungkan semua tugas dan menyertakan browserSync)
exports.serve = gulp.series(
  del,
  gulp.parallel(css, js, html, img, fonts, icons, swiper, datepicker),
  serve,
  watchFiles
);

// Task default yang akan berjalan pertama kali
exports.default = gulp.series(
  del,
  html,
  css,
  js,
  fonts,
  img,
  icons,
  swiper,
  datepicker
);
