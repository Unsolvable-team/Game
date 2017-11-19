"use strict";

const gulp = require('gulp');
const sass = require('gulp-sass');
const minifyCSS = require('gulp-csso');
const babel = require('gulp-babel');

gulp.task('sass', function() {
    return gulp.src('./source/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(minifyCSS({
            restructure: false,
            sourceMap: true,
            debug: true
        }))
        .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('sass:watch', function() {
    gulp.watch('./source/**/*.scss', ['sass']);
});

gulp.task('babel', () =>
    gulp.src('./source/javascripts/*.js')
    .pipe(babel({
        presets: ['env']
    }))
    .pipe(gulp.dest('./public/javascripts'))
);