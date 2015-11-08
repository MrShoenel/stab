/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/oclazyload/oclazyload.d.ts" />
/// <reference path="../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="./app.common.ts" />
/// <reference path="./app.config.ts" />

/**
 * This is the main module of the blog.
 */
module Blog {
	export class BlogApp implements Common.IModuleFactory {
		public createModule(): angular.IModule {
			return Blog.configure(angular.module('blogapp', [
				'ui.router',
				'oc.lazyLoad',
				'ui.bootstrap'
			]).constant('CONFIG', new Common.Constants()
				.add('ITEMS_PER_PAGE', 1)
			).constant('DEBUG', new Common.Constants()
				// now add all debug-specific constants here
				.add('LOG_STATES', false)
			));
		}
	}

	export var module = new BlogApp().createModule();
}
