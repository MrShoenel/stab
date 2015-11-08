/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/requirejs/require.d.ts" />
/// <reference path="../../../typings/oclazyload/oclazyload.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="./../../app.common.ts" />
/// <reference path="./../../app.config.ts" />

/**
 * This is the list module of the blog. This module is responsible for
 * showing all kind of article lists, e.g. "all", "2015", etc.
 */
module Blog.Article {
	export class List implements Common.IModuleFactory {
		public createModule(): angular.IModule {
			return angular.module('blogapp.list', []);
		}
	}

	export var module = new List().createModule();
}
