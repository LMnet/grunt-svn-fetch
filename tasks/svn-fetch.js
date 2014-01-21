/**
 * grunt-svn-fetch
 * https://github.com/jones/svn-fetch
 *
 * Copyright (c) 2013 Stephen Jones
 * Licensed under the MIT license.
 */
module.exports = function (grunt) {
	"use strict";

	grunt.registerMultiTask('svn-fetch', 'Updates or checks out the desired files', function () {
		var exec = require('child_process').exec;
		var options = this.options({
			bin:         'svn',
			repository:  '',
			path:        '',
			execOptions: {}
		});
		var done = this.async();

		var Processor = function(){};
		Processor.prototype = {
			paths: null,
			map: null,

			processMap: function(map) {
				if (map === undefined) {
					grunt.log.error('\n\'map\' missing.');
					return done(false);
				}

				this.map = map;
				this.paths = Object.keys(this.map);
				this.getNextMapping();
			},

			getNextMapping: function() {
				if (this.paths.length > 0) {
					this.processPath(this.paths.shift());
				} else {
					grunt.log.write('\n');
					done(true);
				}
			},

			processPath: function(path) {
				var self = this;
				var command = options.bin;
				var fullPath = options.path + path;
				if (grunt.file.exists(fullPath + '/.svn')) {
					command = [ command, 'update', fullPath ].join(' ');
				} else {
					command = [ command, 'checkout', options.repository + this.map[path], fullPath ].join(' ');
				}
				grunt.log.write('\nProcessing ' + fullPath);
				exec(command, options.execOptions, function (error, stdout) {
					grunt.log.write(stdout);
					if (error !== null) {
						grunt.log.error('\n#' + command + "\n" + error);
						return done(false);
					}
					self.getNextMapping();
				});
			},
		};
		Processor.prototype.constructor = Processor;

		//start processing
		var map = this.data.map;
		(new Processor()).processMap(map);
	});
};