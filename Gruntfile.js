/* global console */
'use strict';
var fs = require('fs'),
	process = require('process'),
	cheerio = require('cheerio'),
	striptags = require('striptags'),
	crypto = require('crypto');

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
					src: ['**/*', '!default*', '!*.md', '!*.jst'],
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
				files: ['./**/*.md'],
				tasks: ['newer:markdown']
			},
			
			typescript: {
				files: ['./resource/**/*.ts'],
				tasks: ['newer:tslint:app', 'newer:typescript:app', 'newer:copy:js']
			}
		}
	});
	
	grunt.registerTask('create-content', function() {
		var contentDir = 'content', rxDefault = /^default/i, rxHtml = /\.html?$/i,
			rxMyDeps = /^mydeps/i, rxTsMap = /\.(?:(ts)|(map))$/i,
			helper = (function() {
				var oldJsonArticles = [];
				try {
					oldJsonArticles = grunt.file.readJSON(
						'./resource/' + contentDir + '/content.json').metaArticles;
				} catch (e) {}
				
				return {
          hashExists: function(hash) {
            return oldJsonArticles.filter(function(metaArt) {
              return metaArt.hash === hash;
            }).length > 0;
          },
          
          lastLastMod: function(hash) {
            return oldJsonArticles.filter(function(metaArt) {
              return metaArt.hash === hash;
            })[0].lastMod;
          }
        };
			})();
		
		var getAutoLastMod = function(path) {
			return new Date(Date.parse(fs.statSync(path).mtime)).toISOString();
		};
		
		var processFile = function(file) {
			var info = {
				path: contentDir + '/' + file,
				type: null
			};
			
			// Check if is a user-dependency (mydeps)
			if (file.startsWith('mydeps')) {
				info.type = 'mydeps';
				return processDependency(info);
			}
			
			var content = grunt.file.read('./resource/' + info.path),
				$ = cheerio.load(content);
			
			if ($('article').length > 0) {
				// is article:
				info.type = 'article';
				return processArticle(file, content, info);
			} else if ($('fragment').length > 0) {
				// is fragment:
				info.type = 'fragment';
				return processFragment(file, content, info);
			} else {
				throw 'Cannot process content-file: ' + file;
			}
		};
		
		/**
		 * This is used to return a dependency where we try to match
		 * a type.
		 * @see: https://oclazyload.readme.io/docs/oclazyload-service
		 */
		var processDependency = function(info) {
			var supportedOcLazyLoadTypes = /(css|html|js)$/i,
				exec = supportedOcLazyLoadTypes.exec(info.path);
			
			if (exec) {
				info.path = { type: exec[1].toLowerCase(), path: info.path };
			} else {
				info.path = info.path;
			}
			
			return info;
		};
		
		/**
		 * Processes the meta-information of an article.
		 */
		var processArticle = function(file, content, info) {
			var $ = cheerio.load(content);
			
			info.lastMod = null;
			info.urlName = null;
			info.teaser = null;
			info.title = null;
			info.hash = crypto.createHash('sha1').update(content).digest('hex');
			
			$('meta').toArray().forEach(function(htmlMeta) {
				var metaName = $(htmlMeta).attr('name').toLowerCase(),
					metaContent = $(htmlMeta).attr('content');
				
				if (metaName === 'lastmodified') {
				if (/last-?modified/i.test(metaName)) {
					if (metaContent === 'auto') {
						// Now we have to check if an update of the lastmod is
						// required by comparing to a hash:
						if (!hashExists(info.hash)) {
							info.lastMod = getAutoLastMod('./resource/' + info.path);
						}
					} else {
						info.lastMod = new Date(Date.parse(metaContent)).toISOString()
					}
				} else if (metaName === 'urlname') {
					info.urlName = metaContent;
				} else if (metaName === 'title') {
					info.title = metaContent;
				} else if (metaName === 'draft') {
					info.draft = true;
				} else {
					info[metaName] = metaContent;
				}
			});
			
			info.teaser = striptags($('article').html()).replace(/\s+/g, ' ').trim();
			if (info.teaser.length > 150) {
				info.teaser = info.teaser.substr(0, 150);
				var idx = info.teaser.lastIndexOf('.');
				if (idx > 0) {
					info.teaser = info.teaser.substr(0, idx) + '.';
				}
			}

			// now check for lastmod, urlname and title:
			if (!info.lastMod) {
				info.lastMod = getAutoLastMod('./resource/' + info.path);
			}
			if (!info.urlName) {
				info.urlName = file;
			}
			if (!info.title) {
				info.title = file;
			}
			
			return info;
		};
		
		/**
		 * Reads one fragment and processes its meta-content.
		 */
		var processFragment = function(file, content, info) {
			var $ = cheerio.load(content);
			
			info.id = null;
			info.content = null;
			info.mime = null;
			
			// If we find a fragment-tag with name "embed" (regardless of its value),
			// we will set the path to null and the content to the fragment's content.
			$('meta').toArray().forEach(function(frgMeta) {
				var frgName = $(frgMeta).attr('name').toLowerCase(),
					frgContent = $(frgMeta).attr('content') || '';
				
				if (frgName === 'embed') {
					info.path = null;
					info.content = '<fragment>' + $('fragment').html() + '</fragment>';
				} else {
					info[frgName] = frgContent;
				}
			});
				
			if (!info.id) {
				throw 'Each fragment must have a unique ID.';
			}
			
			return info;
		};
		
		var files = grunt.file.expand({
			filter: 'isFile',
			cwd: './resource/' + contentDir
		}, '**/*').filter(function(file) {
			var ignore = [
				'content.json',
				'default.html',
				'default-md.html',
				'default-md.md',
				'default-md.template.jst',
				'defaultFragment.html',
				'defaultFragment-md.html',
				'defaultFragment-md.md',
				'defaultFragment-md.template.jst'
			];
			
			return ignore.indexOf(file) === -1 &&
				!rxDefault.test(file) &&
				!rxTsMap.test(file) &&
				(rxHtml.test(file) || rxMyDeps.test(file));
		}).map(processFile).filter(function(file) {
			// This change allows us to attach a draft-property to any kind
			// of article, fragment or dependency. 
			return !file.hasOwnProperty('draft');
		});
		
		var rmProps = function(obj) {
			delete obj['type'];
			delete obj['last-modified']; // we will have 'lastMod'
			return obj;
		};
		
		grunt.file.write('./resource/' + contentDir + '/content.json', JSON.stringify({
			mydeps: files.filter(function(file) { return file.type === 'mydeps'; }).map(rmProps),
			metaArticles: files.filter(function(file) { return file.type === 'article'; }).map(rmProps),
			metaFragments: files.filter(function(file) { return file.type === 'fragment'; }).map(rmProps)
		}));
		console.log('>> Wrote content.json');
	});
	
	grunt.registerTask('make-content', [
		'clean:content',
		'markdown:content',
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
			'concat:css',
			'exec:changelog'
		];
		
		if (grunt.option('optimize')) {
			tasks.splice(tasks.length - 1, 0, 'optimize');
		}
		
		return tasks;
	})());
};