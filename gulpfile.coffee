'use strict';

# Settings
BASEPATH = './'
PATHS =
    STATIC:
        SRC: BASEPATH + 'samples/'
    SCRIPTS:
        SRC: BASEPATH + 'src/'
    STYLES:
        SRC: BASEPATH + 'samples/_scss/'
        DEST: BASEPATH + 'samples/css/'
PORT = '3501'
AUTOPREFIXER_BROWSERS = [
    'last 2 versions'
    'IE >= 8'
    'Firefox ESR'
    'Android >= 4.1'
]

# Load Modules
gulp = require 'gulp'
path = require 'path'
plugins = require('gulp-load-plugins')()
browserSync = require 'browser-sync'
reload = browserSync.reload
jshintStylish = require 'jshint-stylish'

# Tasks
gulp.task 'browser-sync', ->
    browserSync
        server:
            baseDir: BASEPATH
        port: PORT
        browser: "google chrome"
    return

gulp.task 'styles', ->
    gulp.src(PATHS.STYLES.SRC + '*.scss')
        .pipe plugins.sourcemaps.init()
        .pipe plugins.sass
            onError: (err) ->
                plugins.notify().write err
        .pipe plugins.autoprefixer
            browsers: AUTOPREFIXER_BROWSERS
        .pipe plugins.sourcemaps.write('.')
        .pipe gulp.dest(PATHS.STYLES.DEST)

gulp.task 'jshint', ->
    gulp.src PATHS.SCRIPTS.SRC + '*.js'
        .pipe plugins.jshint()
        .pipe plugins.jshint.reporter(jshintStylish)
        .pipe plugins.notify((file) ->
            # http://stackoverflow.com/questions/22787673/gulp-sass-error-with-notify#answer-23115547
            if file.jshint.success
                # Don't show something if success
                return false
            errors = file.jshint.results.map((data) ->
                if data.error
                    return '(' + data.error.line + ':' + data.error.character + ') ' + data.error.reason
                return
            ).join('\n')
            file.relative + ' (' + file.jshint.results.length + ' errors)\n' + errors
        )

gulp.task 'watch', ->
    gulp.watch PATHS.STATIC.SRC + '*.html', browserSync.reload
    gulp.watch PATHS.STYLES.SRC + '*.scss', ['styles', browserSync.reload]
    gulp.watch PATHS.SCRIPTS.SRC + '*.js', ['jshint', browserSync.reload]
    return

gulp.task 'default', [
    'browser-sync'
    'watch'
]
