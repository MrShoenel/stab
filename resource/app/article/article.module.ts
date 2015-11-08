/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/requirejs/require.d.ts" />
/// <reference path="../../../typings/oclazyload/oclazyload.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="./../../app.common.ts" />
/// <reference path="./../../app.config.ts" />

/**
 * This is the main module of the blog.
 */
module Blog.Article {
	export class Article implements Common.IModuleFactory {
		public createModule(): angular.IModule {
			return angular.module('blogapp.article', []);
		}
	}

	export var module = new Article().createModule();
}
