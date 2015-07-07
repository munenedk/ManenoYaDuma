var gulp = require('gulp'),
gutil = require('gulp-util'),
debug = require('gulp-debug'),
autoprefixer =  require('gulp-autoprefixer'),
minifycss = require('gulp-minify-css'),
jshint = require('gulp-jshint'),
uglify = require('gulp-uglify'),
imagemin =  require('gulp-imagemin'),
rename = require('gulp-rename'),
concat = require('gulp-concat'),
notify =  require('gulp-notify'),
cache =  require('gulp-cache'),
livereload =  require('gulp-livereload'),
browserify =  require('gulp-browserify'),
embedlr = require('gulp-embedlr'),
esnext = require('gulp-esnext'),
del =  require('del'),
path = require('path'),
runSequence =  require('run-sequence'),
expressPort = 8081,
expressRoot = ('./dist/'),
liverReloadPort = 35729;


//start express server
gulp.task('express',function(){
	var express = require('express');
	var app =  express();
	app.use(require('connect-livereload')({port: liverReloadPort}));
	app.use(express.static(expressRoot));
	app.listen(expressPort);
});


//HTML task
gulp.task('html',function(){
	return gulp.src('app/*.html')
	.pipe(gulp.dest('dist'));
	// .pipe(notify({message: 'Html task complete'}));
});


//Views Task
gulp.task('views',function(){
	return gulp.src('app/views/**/*.html')
	.pipe(gulp.dest('dist/views'));
});

//Fonts Task
gulp.task('fonts',function(){
	return gulp.src(['app/fonts/*',
		"bower_components/bootstrap/dist/fonts/*",
		"bower_components/font-awesome/fonts/*"])
	.pipe(gulp.dest('dist/fonts'));
	// .pipe(notify({message: 'Fonts task completed'}));
});

gulp.task('font',function(){
	return gulp.src([
		'node_modules/materialize-css/font/**'])
	.pipe(gulp.dest('dist/font'));
});


//Styles Task
gulp.task('styles',function(){
	return gulp.src('app/css/**/*.css')
	.pipe(autoprefixer('last 2 version', 'safari 5','ie 8','ie 9','opera 12.1','ios 6','android 4'))
	.pipe(concat('bundle.css'))
	.pipe(gulp.dest('dist/css'))
	.pipe(rename({suffix: '.min'}))
	.pipe(minifycss())
	.pipe(gulp.dest('dist/css'));
	// .pipe(notify({message: 'Style task complete'}));
});

//Linked Styles
gulp.task('linked_styles',function(){
	return gulp.src(['node_modules/angular-material/angular-material.css',
		"bower_components/ng-table/dist/ng-table.css",
		// "bower_components/bootstrap/dist/css/bootstrap.css",
		// "bower_components/bootstrap/dist/css/bootstrap.css.map",
		"bower_components/font-awesome/css/font-awesome.css",
		"bower_components/font-awesome/css/font-awesome.css.map",
		"node_modules/materialize-css/bin/materialize.css",
		"node_modules/v-accordion/dist/v-accordion.css"])
	.pipe(gulp.dest('dist/css'));
});

// Linked Scripts Task
gulp.task('linked_scripts',function(){
	gulp.src(['app/linked_scripts/**/*.js',
		'bower_components/ng-table/dist/ng-table.js',
		'bower_components/ng-table/dist/ng-table.min.js.map',
		// 'bower_components/bootstrap/dist/js/bootstrap.js',
		'bower_components/angular-file-upload/angular-file-upload.js',
		'node_modules/jquery/dist/jquery.js',
		'node_modules/materialize-css/bin/materialize.js',
		'node_modules/v-accordion/dist/v-accordion.js'])
	.pipe(gulp.dest('dist/linked_scripts'));
});

//Scripts Task
gulp.task('scripts',['linked_scripts'],function(){
	gulp.src(['./app/scripts/**/*.js','/app.js'])
	.pipe(browserify({
		insertGlobals: true,
		debug: true
	}))
	.pipe(concat('bundle.js'))
	.pipe(gulp.dest('dist/scripts'))
	.pipe(rename({suffix: '.min'}))
	.pipe(uglify())
	.pipe(gulp.dest('dist/scripts'));
});

//Images Task
gulp.task('images',function(){
	return gulp.src('app/img/**/*')
	.pipe(imagemin({optimizationLevel: 3, progressive: true, interlaced: true}))
	.pipe(gulp.dest('dist/img'));
	// .pipe(notify({message: 'Images task complete'}));
});

gulp.task('build',function(done){
	runSequence('clean',
		['styles','linked_styles','scripts','images','fonts','font','html','views'],
		'copy_to_cordova',
		'express',
		'watch',
		done);
});

//Copy Files to Cordova
gulp.task('copy_to_cordova',function(){
	return gulp.src('dist/**/*')
	.pipe(gulp.dest('cordova_app/www'));
});

//Clean task
gulp.task('clean',function(done){
	del('dist/',done);
});

//Detault Task
gulp.task('default',['build']);

//Watch Task
gulp.task('watch',function(){
	//watch html files
	gulp.watch('app/*.html',['html']);
	gulp.watch('app/views/**/*.html', ['views']);

	// watch css files
	gulp.watch('app/css/**/*.css', ['styles']);

	//watch linked scripts
	gulp.watch('app/linked_scripts/**/*.js', ['linked_scripts']);

	//watch .js files
	gulp.watch('app/scripts/**/*.js',['scripts']);

	//watch image files
	gulp.watch('app/img/**/*.js',['images']);

	//live reload
	livereload.listen(liverReloadPort);

	//watch any files in dist/, reload on change
	gulp.watch(['dist/**']).on('change',livereload.changed);

});