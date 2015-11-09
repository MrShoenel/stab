/* global console */
'use strict';
var cheerio = require('cheerio'),
	striptags = require('striptags');

module.exports = function(grunt) {
	// Dynamically loads all required grunt tasks
	require('matchdep').filterDev('grunt-*')
		.forEach(grunt.loadNpmTasks);
		
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		////////////////////////////////////////////////////////////////
		//
		// Now, this is the alphabetical list of grunt-tasks.
		// Note: The actual main-taks (default, watch etc.)
		//       are defined at the end of this file!
		//
		////////////////////////////////////////////////////////////////
		
		/**
		 * This task removes files or entire directories.
		 */
		clean: {
			content: ['./public/content/*'],
			css: ['./public/style/*'],
			html: ['./public/**/*.html'],
			js: ['./public/script/*']
		},

		/**
		 * Tasks to copy-over specific files to specific directories.
		 * This is usually the case if we copy something from ./resoure
		 * over to ./public.
		 */
		copy: {
			assets: {
				files: [{
					expand: true,
					cwd: './resource/',
					src: ['favicon.ico', 'fonts/**/*', 'images/**/*'],
					dest: 'public/'
				}]
			},
			
			content: {
				files: [{
					expand: true,
					cwd: './resource/content/',
					src: ['**/*', '!default.html'],
					dest: 'public/content/'
				}]
			},

			html: {
				files: [{
					expand: true,
					cwd: './resource/',
					src: ['**/*.html', '!**/default.html', '!**/app/**/*.html'],
					dest: 'public/'
				}, {
					expand: true,
					cwd: './resource/app/',
					src: ['**/*.html'],
					dest: 'public/script/app/'
				}]
			},

			js: {
				files: [{
					expand: true,
					cwd: './resource/',
					src: ['**/*.js', '!bower/**'],
					dest: 'public/script/'
				}]
			},
			
			lessed: {
				files: [{
					expand: true,
					cwd: './resource/style/',
					src: ['*.css'],
					dest: './public/style/'
				}]
			},
			
			/**
			 * Cpies over the release-versions of the libs.
			 */
			libs: {
				files: [{
					src: './resource/bower/angular/angular.min.js',
					dest: './public/script/lib/angular.min.js'
				}, {
					src: './resource/bower/angular-ui-router/release/angular-ui-router.min.js',
					dest: './public/script/lib/angular-ui-router.min.js'
				}, {
					src: './resource/bower/oclazyload/dist/ocLazyLoad.require.min.js',
					dest: './public/script/lib/oclazyload.require.min.js'
				}, {
					src: './resource/bower/requirejs/require.js',
					dest: './public/script/lib/require.js'
				}, {
					src: './resource/bower/angular-bootstrap/ui-bootstrap.min.js',
					dest: './public/script/lib/ui-bootstrap.min.js'
				}, {
					src: './resource/bower/angular-bootstrap/ui-bootstrap-tpls.min.js',
					dest: './public/script/lib/ui-bootstrap-tpls.min.js'
				}, {
					src: './resource/bower/bootstrap-css-only/css/bootstrap.min.css',
					dest: './public/style/bootstrap.min.css'
				}, {
					src: './resource/bower/bootstrap-css-only/css/bootstrap-theme.min.css',
					dest: './public/style/bootstrap-theme.min.css'
				}]
			}
		},
		
		/**
		 * This task is a simple HTTP server. Override the default port 8080 by
		 * specifying an alternative with "--port=<port>".
		 */
		'http-server': {
			default: {
				cache: 1, // 0 will give us one hour so we'll do it this way
				root: './public/',
				port: parseInt(grunt.option('port')) || 80,
				logFn: function() {} // no thanks
			}
		},

		/**
		 * All LESS tasks
		 */
		less: {
			toCss: {
				options: {
					compress: true
				},
				files: {
					// add file <=> file relation or have multiple files less'ed
					// into one file by using path expanders ({,*}*.less)
					'./resource/style/all.css': ['./resource/style/clean-blog.less', './resource/style/main.less']
				}
			}
		},
		
		/**
		 * This tasks checks our good style during development :) It uses
		 * the parameters defined in tslint.json.
		 */
		tslint: {
			options: {
				configuration: grunt.file.readJSON('tslint.json')
			},

			app: {
				files: {
					src: ['./app.ts', './resource/script/*.ts']
				}
			}
		},
		
		/**
		 * All TypeScript compilation tasks
		 */
		typescript: {
			app: {
				src: ['./resource/**/*.ts', '!./resource/bower/**'],
				options: {
					module: 'amd',
					target: 'ES5',
					sourceMap: true,
					declaration: false // won't create *.d.ts files
				}
			}
		},

		////////////////////////////////////////////////////////////////
		//
		// Below this line only main tasks, alphabetically (the tasks
		// from above are usually not called directly).
		//
		////////////////////////////////////////////////////////////////
		
		/**
		* This one allows to perform multiple (watch-)tasks in parallel.
		*/
		concurrent: {
			options: { logConcurrentOutput: true },
			
			// Tasks to watch
			all: {
				tasks: ['http-server', 'watch']
			}
		},
		
		/**
		* All watchable tasks. The specified tasks will be run if
		* the files specified change.
		*/
		watch: {
			content: {
				files: ['./resource/content/**/*', '!./resource/content/content.json'],
				tasks: ['clean:content', 'make-content', 'copy:content']
			},
			
			html: {
				files: ['./resource/**/*.html', '!./resource/bower/**/*.html'],
				tasks: ['clean:html', 'newer:copy:html']
			},
			
			less: {
				files: ['./resource/style/*.less'],
				tasks: ['newer:less:toCss', 'newer:copy:lessed', 'newer:copy:lessed']
			},
			
			typescript: {
				files: ['./resource/**/*.ts'],
				tasks: ['newer:tslint:app', 'newer:typescript:app', 'newer:copy:js']
			}
		}
	});
	
	grunt.registerTask('make-content', function() {
		var contentDir = 'content', rxHtml = /\.html?$/i;
		
		var files = grunt.file.expand({
			filter: 'isFile',
			cwd: './resource/' + contentDir
		}, '*').filter(function(file) {
			return file !== 'content.json' && file !== 'default.html';
		}).map(function(file) {
			var info = {
				path: contentDir + '/' + file,
				lastMod: null,
				urlName: null,
				title: null,
				teaser: null,
				meta: {}
			};
			
			if (rxHtml.test(file)) {
				var $ = cheerio.load(grunt.file.read('./resource/' + info.path));
				
				$('meta').toArray().forEach(function(htmlMeta) {
					var metaName = $(htmlMeta).attr('name').toLowerCase(),
						metaContent = $(htmlMeta).attr('content');
					
					if (metaName === 'last-modified') {
						info.lastMod = new Date(Date.parse(metaContent)).toISOString()
					} else if (metaName === 'urlname') {
						info.urlName = metaContent;
					} else if (metaName === 'title') {
						info.title = metaContent;
					} else {
						info.meta[metaName] = metaContent;
					}
				});
				
				info.teaser = striptags($('article').html()).replace(/\s+/g, ' ');
			}
			
			return info;
		});
		
		grunt.file.write('./resource/' + contentDir + '/content.json', JSON.stringify(files));
		console.log('>> Wrote content.json');
	});
	
	grunt.registerTask('watch-all', [
		'default',
		
		'make-content',
		
		'concurrent:all'
	]);
	
	grunt.registerTask('default', [
		'clean',
		'less', 'tslint', 'typescript', 'make-content',
		'copy'
	]);
};