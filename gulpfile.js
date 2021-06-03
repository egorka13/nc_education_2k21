const { series, parallel, src, dest } = require('gulp')

const gulp = require('gulp'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    svgmin = require('gulp-svgmin'),
    svgstore = require('gulp-svgstore'),
    inject = require('gulp-inject'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(),
    rename = require('gulp-rename')

gulp.task('svgstore', function () {
    const svgs = gulp
        .src('./src/assets/icons/**/*.svg')
        .pipe(
            svgmin(function () {
                return {
                    plugins: [
                        {
                            removeTitle: true,
                        },
                        {
                            removeStyleElement: true,
                        },
                    ],
                }
            })
        )
        .pipe(rename({ prefix: 'icon-' }))
        .pipe(svgstore({ inlineSvg: true }))

    function fileContents(filePath, file) {
        return file.contents.toString()
    }

    return gulp
        .src('./src/index.html')
        .pipe(inject(svgs, { transform: fileContents }))
        .pipe(gulp.dest('./src'))
})

gulp.task('less', function () {
    return src('./src/assets/styles/main.less')
        .pipe(less())
        .pipe(
            autoprefixer({
                cascade: false,
            })
        )
        .pipe(dest('./dist'))
})

gulp.task('js', function () {
    return src('./src/assets/scripts/*.js')
        .pipe(
            babel({
                presets: ['@babel/env'],
            })
        )
        .pipe(concat('script.js'))
        .pipe(gulp.dest('./dist'))
})

gulp.task('html', function () {
    return gulp.src('./src/index.html').pipe(gulp.dest('./dist'))
})

gulp.task('fonts', function () {
    return gulp.src('./src/assets/fonts/*').pipe(gulp.dest('./dist/src/fonts'))
})

gulp.task('images', function () {
    return gulp.src('./src/assets/img/*').pipe(gulp.dest('./dist/src/img'))
})

gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: 'dist',
        },
    })

    gulp.watch('./src/assets/styles/**/*.less').on('change', series('less'))
    gulp.watch('./src/assets/scripts/*.js').on('change', series('js'))
    gulp.watch('./src/index.html').on('change', series('html'))

    gulp.watch('./dist/style.css').on('change', browserSync.reload)
    gulp.watch('./dist/index.html').on('change', browserSync.reload)
    gulp.watch('./dist/script.js').on('change', browserSync.reload)
})

gulp.task(
    'build',
    series(
        parallel('fonts', 'images', 'js'),
        'svgstore',
        parallel('html', 'less')
    )
)

gulp.task(
    'default',
    series(
        parallel('fonts', 'images', 'js'),
        'svgstore',
        parallel('html', 'less'),
        'serve'
    )
)
