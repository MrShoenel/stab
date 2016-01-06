/* global console */
'use strict';
var fs = require('fs'),
	process = require('process'),
	cheerio = require('cheerio'),
	stabContentProcessor = require('stab-content-processor');

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
      options: { force: true },

			content: ['./public/content/*'],
			css: ['./public/style/*'],
			css_libs: ['./public/style/*.min.css'],
			html: ['./public/**/*.html'],
			js: ['./public/script/*']
		},
		
		/**
		 * This task we're using to concatenate specific file
		 * types so we don't have to load too many files.
		 */
		concat: {
			css: {
				options: {
					separator: '\n;\n'
				},
				src: ['./public/style/**/*.min.css', '!./public/style/libs.css'],
				dest: './public/style/libs.css'
			}
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
					src: ['**/*', '!**/default*', '!**/*.md', '!**/*.jst'],
					dest: 'public/content/'
				}]
			},

			html: {
				files: [{
					expand: true,
					cwd: './resource/',
					src: ['**/*.html', '!**/default*', '!**/app/**/*.html'],
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
					src: ['**/*.js', '!bower/**', '!content/**/*.js'],
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
				}, {
					src: './resource/bower/angular-animate/angular-animate.min.js',
					dest: './public/script/lib/angular-animate.min.js'
				}]
			}
		},
		
		/**
		 * This section contains commands which we execute through grunt.
		 */
		exec: {
			changelog: {
				stdout: false,
				stderr: false,
				command: 'git -C ' + process.cwd() + ' log --pretty=format:"([`%h`](https://github.com/MrShoenel/stab/commit/%H)) %s"',
				callback: function(error, stdout, stderr) {
					if (error) {
						console.error(error);
						return;
					}
					
					var mileStoneMatch = /\d+?\.\d+?\.\d+?/i;
					
					var lines = stdout.split('\n').filter(function(line) {
						return line.trim().length > 0;
					}).map(function(line) {
						line = line.trim();
						return '* ' + (mileStoneMatch.test(line) ? '**' + line + '**' : line);
					});
					
					grunt.file.write('change.log', lines.join('\n'));
					console.log('>> Wrote change.log');
				}
			}
		},
		
		/**
		 * This task we use to compress the templates used by stab.
		 * This task is only used when --optimize is present.
		 */
		htmlclean: {
			options: { },
			templates: {
				expand: true,
				cwd: './public/script/app/',
				src: '**/*.html',
				dest: './public/script/app/'
			}
		},

		/**
		 * This task is a simple HTTP server. Override the default port
		 * 8080 by specifying an alternative with "--port=<port>".
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
					compress: true,
					plugins: [
						new (require('less-plugin-autoprefix'))({browsers : [ "last 2 versions" ]})
					]
				},
				files: {
					// add file <=> file relation or have multiple files less'ed
					// into one file by using path expanders ({,*}*.less)
					'./resource/style/all.css': ['./resource/style/clean-blog.less', './resource/style/main.less']
				}
			}
		},
		
		/**
		 * These tasks watch our readme.md and especially those articles that
		 * are created using markdown (in the content directory).
		 */
		markdown: {
			content: {
				options: {
					template: './resource/content/default-md.template.jst',
					postCompile: function(src, context) {
						var $ = cheerio.load(src),
							metas = $('div#meta meta').toArray().map(function(m) {
								return $.html(m);
							}).join('\n');
						
						$('div#meta').remove();
						return metas + '\n\n<article>\n' + $.html().trim() + '\n</article>';
					}
				},
				files: [{
					expand: true,
					cwd: './resource/content/',
					src: ['**/*.md', '!default*md'],
					dest: './resource/content/',
					ext: '.html'
				}]
			},
			
			readme: {
				options: {},
				files: [{
					expand: true,
					cwd: './',
					src: ['readme.md'],
					dest: './',
					ext: '.html'
				}]
			}
		},
		
		/**
		 * This task is necessary because we the uglifier would break our code
		 * where it lacks proper ngAnnotatedConstructor-functions.
		 */
		ngAnnotate: {
			all: {
				options: {
					singleQuotes: true
				},
				files: [{
					expand: true,
					src: ['./public/**/*.js', '!public/**/*min.js']
				}],
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
		
		/**
		 * Used as minifer. We minify each file and do not concatenate
		 * them, because we want to preserve lazy-loading with ocLazyLoad.
		 */
		uglify: {
			all: {
				mangle: true,
				mangleProperties: true,
				files: grunt.file.expandMapping(['./public/**/*.js', '!public/**/*min.js'], './')
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
			},
			content: {
				tasks: ['http-server', 'watch:content']
			}
		},
		
		/**
		* All watchable tasks. The specified tasks will be run if
		* the files specified change.
		*/
		watch: {
			content: {
				files: ['./resource/content/**/*', '!./resource/content/content.json'],
				tasks: ['make-content']
			},
			
			html: {
				files: ['./resource/**/*.html', '!./resource/bower/**/*.html'],
				tasks: ['clean:html', 'newer:copy:html']
			},
			
			less: {
				files: ['./resource/style/*.less'],
				tasks: ['newer:less:toCss', 'newer:copy:lessed', 'newer:copy:lessed', 'concat:css']
			},
			
			markdown: {
				files: ['./readme.md', './resource/**/*.md'],
				tasks: ['newer:markdown']
			},
			
			typescript: {
				files: ['./resource/**/*.ts'],
				tasks: ['newer:tslint:app', 'newer:typescript:app', 'newer:copy:js']
			}
		}
	});
	
	grunt.registerTask('create-content', function() {
		stabContentProcessor.createContentJSON();
		console.log('>> Wrote content.json');
	});
	
	
	grunt.registerTask('markdown-content', function() {
		stabContentProcessor.markdownContent();
		console.log('>> Created Html of markdown content.');
	});
	
	grunt.registerTask('make-content', [
		'clean:content',
		//'markdown:content',
		'markdown-content',
		'create-content',
		'copy'
	]);
	
	grunt.registerTask('watch-all', [
		'default',		
		'concurrent:all'
	]);
	
	grunt.registerTask('watch-content', [
		'concurrent:content'
	]);
	
	grunt.registerTask('optimize', [
		// Template-html:
		'htmlclean:templates',
		// JavaScript:
		'ngAnnotate', 'uglify',
		// Css:
		'concat:css', 'clean:css_libs'
	]);
	
	grunt.registerTask('default', (function() {
		var tasks = [
			'clean',
			'less', 'tslint', 'typescript', 'markdown', 'create-content',
			'copy',
			'concat:css'
		];
		
		if (grunt.option('optimize')) {
      tasks.pop();
      tasks.push('optimize');
		}
		
		return tasks;
	})());
};