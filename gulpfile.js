// Bring in the required dependencies

var fs = require("fs"); // File system module
var gulp = require("gulp"); // Gulp module
var tsc = require("gulp-typescript"); // Gulp plug-in for Typescript transpiler
var del = require("del"); // Delete module
var merge = require("merge2"); // Merge module (note: 'merge2' module which supports multiple streams)
var sourcemaps = require("gulp-sourcemaps"); // Gulp plug-in to generate source maps
var exec = require("child_process").exec; // Need a child process executor to run commands
var clear = require("clear"); // Console clear module

// Cleaning task
gulp.task("clean",function(){
	del(["./dest/*"], function(){
		console.log("Clean task complete !");
	});
});

// Compiling Typescript files task using 'typescript'
gulp.task("tscompile", function(){
	var options = JSON.parse(fs.readFileSync("./tsconfig.json"));
	//console.log(options);
	var compileResults = gulp.src("src/*.ts").pipe(tsc(options));
	console.log("\nCompilation task complete !");
	return merge(
		compileResults.dts.pipe(gulp.dest("dest/definitions")),
		compileResults.js.pipe(sourcemaps.init())
			.pipe(sourcemaps.write("../sourcemaps"))
			.pipe(gulp.dest("dest/js"))
		);
});

// Compiling Typescript files task using 'ntypescript'
gulp.task("ntscompile", function(){
	exec("ntsc", function(err, message, stderr){
		clear();
		if (err) {
			console.log("\nCompile time error(s) found in the source code:\n");
			console.log(message);
		} else {
			console.log("\nCongratulations! Compilation successful with no error(s).\n");
			console.log("Following files were in the build path: \n")
			console.log(message);
		}
	});
});

// Running compiled code whenever available
gulp.task("run", function(){
	
	console.log("Started run task !");
	// Execute program only if the compiled output is available
	fs.exists("dest/submain.js", function(exists) {
		if (exists) {
			exec("node dest/submain.js", function(err,output){
				if (err) {
					console.log(err);
				} else {
					console.log("\nFinished executing the application. Here's the console output of the execution: \n");
					console.log(output);
				}
			});			
		}
	});
});

// Watch source folders for change in source code
gulp.task("watch", function(){
	gulp.watch(["src/*.ts"], ["clean","ntscompile"]);
	gulp.watch(["dest/submain.js"], ["run"]);
	console.log("\nI'm watching the source folder now for code changes !");
});

// Default task to start off Gulp execution
gulp.task("default", ["clean","ntscompile","watch"], function(){
	console.log("\nDefault task execution complete !");
});
