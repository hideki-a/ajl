'use strict';

# Path Settings
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
LIVERELOAD_PORT = 35729
AUTOPREFIXER_BROWSERS = [
    'last 2 versions'
    'IE >= 8'
    'Firefox ESR'
    'Android >= 4.1'
]

# Read Modules
gulp = require 'gulp'
path = require 'path'
plugins = require('gulp-load-plugins')()

# LiveReload
# http://rhumaric.com/2014/01/livereload-magic-gulp-style/
notifyLiveReload = (e) ->
    filename = path.relative(__dirname, e.path)
    tinylr.changed body:
        files: [filename]
    return

tinylr = undefined

# Tasks
gulp.task 'livereload', ->
    tinylr = require('tiny-lr')()
    tinylr.listen LIVERELOAD_PORT
    return

gulp.task 'serve', ->
    connect = require 'connect'
    serveStatic = require 'serve-static'
    app = connect()

    app.use require('connect-livereload')(port: LIVERELOAD_PORT)
    app.use serveStatic __dirname
    app.listen PORT
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
        .pipe plugins.jshint.reporter('default')

gulp.task 'watch', ->
    gulp.watch PATHS.STATIC.SRC + '*.html', notifyLiveReload
    gulp.watch PATHS.STYLES.SRC + '*.scss', ['styles']
    stylewatcher = gulp.watch PATHS.STYLES.DEST + '*.css'
    jswatcher = gulp.watch PATHS.SCRIPTS.SRC + '*.js', ['jshint']
    jswatcher.on 'change', notifyLiveReload
    stylewatcher.on 'change', notifyLiveReload
    return

gulp.task 'default', [
    'livereload'
    'serve'
    'watch'
]
