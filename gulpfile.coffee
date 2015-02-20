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
    DIST: BASEPATH + 'dist/'
PORT = '3501'
AUTOPREFIXER_BROWSERS = [
    'last 2 versions'
    'IE >= 9'
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
minimist = require 'minimist'

# CLI options
# https://github.com/gulpjs/gulp/blob/master/docs/recipes/pass-arguments-from-cli.md
knownOptions =
    string: 'plugins'
    default: ''

options = minimist process.argv.slice(2), knownOptions;

# Tasks
gulp.task 'serve', ->
    browserSync
        server:
            baseDir: BASEPATH
        port: PORT
        browser: 'google chrome'
        startPath: PATHS.STATIC.SRC
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

gulp.task 'build', ->
    now = new Date()
    banner = '/*! Build: ' + now.toLocaleString() + '; Build Option: ' + options.plugins + ' */\n'
    files = [PATHS.SCRIPTS.SRC + 'ajl.core.js']
    ajlPlugins = options.plugins.split(",")
    ajlPlugins.forEach (pluginName) ->
        files.push PATHS.SCRIPTS.SRC + "ajl." + pluginName.toLowerCase() + ".js"
        return
    return gulp.src files
        .pipe plugins.concat 'ajl.custom.js'
        .pipe plugins.header banner
        .pipe gulp.dest PATHS.DIST
        .pipe plugins.rename 'ajl.custom.min.js'
        .pipe plugins.uglify
            preserveComments: 'some'
        .pipe gulp.dest PATHS.DIST

gulp.task 'watch', ->
    gulp.watch PATHS.STATIC.SRC + '*.html', browserSync.reload
    gulp.watch PATHS.STYLES.SRC + '*.scss', ['styles', browserSync.reload]
    gulp.watch PATHS.SCRIPTS.SRC + '*.js', ['jshint', browserSync.reload]
    return

gulp.task 'default', [
    'serve'
    'watch'
]
