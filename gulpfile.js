var gulp = require('gulp');
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');

gulp.task('browserify', function() {
        browserify('./src/app.js')
            .transform('reactify')
            .bundle()
            .pipe(source('app.js'))
            .pipe(gulp.dest('dist/js'));
});

gulp.task('copy', function() {
    gulp.src('src/index.html')
            .pipe(gulp.dest('dist'));
    gulp.src('src/lib/**/*.*')
        .pipe(gulp.dest('dist/lib');
});

gulp.task('working', function () {
    return gulp.watch('src/**/*.*', ['browserify', 'copy'])
});
    
gulp.task('default', ['browserify', 'copy']);
