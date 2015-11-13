/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/requirejs/require.d.ts" />
/// <reference path="../../../typings/oclazyload/oclazyload.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="./../../app.common.ts" />
/// <reference path="./../../app.config.ts" />
/// <reference path="./ui-router-stateData.controller.ts" />

/**
 * This is the main module of the blog.
 */
module Ui.Router.StateData {
	export class UiRouterStateData implements Common.IModuleFactory {
		public createModule(): angular.IModule {
			return angular.module('ui.router.stateData', ['ui.router'])
				.run(['$rootScope', ($rootScope: angular.IRootScopeService) => {
				}]);
		}
	}

	export var module = new UiRouterStateData().createModule();
}
