import { src, dest, series, watch } from 'gulp';
import concat from 'gulp-concat';
import htmlMin from 'gulp-htmlmin';
import autoprefixer from 'gulp-autoprefixer';
import cleanCss from 'gulp-clean-css';
import browserSync from 'browser-sync';
import svgSprite from 'gulp-svg-sprite';
import image from 'gulp-image';
import sourcemaps from 'gulp-sourcemaps';
import * as del from 'del';
import gulpIf from 'gulp-if';
import gulpSass from 'gulp-sass';
import sassCompiler from 'sass';

const sass = gulpSass(sassCompiler);
let prod = false;

const isProd = (done) => {
  prod = true;
  done();
}

const bs = browserSync.create();

const clean = () => {
  return del.deleteAsync(['dist'])
}

// const resources = () => {
//   return src('src/resources/**')
//     .pipe(dest('dist'))
// }

const styles = async () => {
  return src('src/styles/**/*.scss')
    .pipe(gulpIf(!prod, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('main.css'))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(gulpIf(prod, cleanCss({
      level: 2
    })))
    .pipe(gulpIf(!prod, sourcemaps.write()))
    .pipe(dest('dist'))
    .pipe(bs.stream()).gitignore
}

const fonts = () => {
  return src([
    'src/fonts/**/*.woff2',
    'src/fonts/**/*.woff'
  ],{ encoding: false })
    .pipe(dest('dist/fonts'))
}

const htmlMinify = () => {
  return src('src/**/*.html')
    .pipe(gulpIf(prod, htmlMin({
      collapseWhitespace: true,
    })))
    .pipe(dest('dist'))
    .pipe(bs.stream())
}

const svgSprites = () => {
  return src('src/images/svg/**/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(dest('dist/images'))
}

const images = () => {
  return src([
    'src/images/**/*.jpg',
    'src/images/**/*.png',
    'src/images/*.svg',
    'src/images/**/*.jpeg'
  ], { encoding: false })
    .pipe(image())
    .pipe(dest('dist/images'))
}

const watchFiles = () => {
  bs.init({
    server: {
      baseDir: 'dist'
    }
  });
  watch('src/**/*.html', htmlMinify);
  watch('src/styles/**/*.scss', styles);
  watch('src/images/svg/**/*.svg', svgSprites);
}


export { styles, htmlMinify, clean }
export const dev = series(clean, htmlMinify, fonts, styles, images, svgSprites, watchFiles);
export const build = series(isProd, clean, htmlMinify, fonts, styles, images, svgSprites);
export default dev;
