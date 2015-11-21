/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/requirejs/require.d.ts" />
/// <reference path="../../../typings/oclazyload/oclazyload.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="./../../app.common.ts" />
/// <reference path="./../../app.config.ts" />

/**
 * This module is based on ideas for angular-ui-router-title. It
 * provides arbitrary and hierarchical state-data. This module is
 * an enhanced replacement for angular-ui-router-title.
 */
module Ui.Router.StateData {
	export class UiRouterStateData implements Common.IModuleFactory {
		public createModule(): angular.IModule {
			return angular.module('ui.router.stateData', ['ui.router'])
				.run(['$rootScope', '$timeout', '$state',
				(
					$rootScope: angular.IRootScopeService, $timeout: angular.ITimeoutService, $state: angular.ui.IStateService
				) => {
					$rootScope.$on('$stateChangeStart', () => {
						delete $rootScope['$uiStateData'];
					});
					
					$rootScope.$on('$stateChangeSuccess',
					(
						event: angular.IAngularEvent, toState: angular.ui.IState, toParams: Common.IKVStore<any>, fromState: angular.ui.IState, fromParams: Common.IKVStore<any>
					) => {
						
						// In this array we will store all states from this one upwards,
						// and the root state will be the last one in this array. This is
						// important as we'll be building up the $uiStateData bottom to top.
						var stateHierarchy: angular.ui.IResolvedState[] = [];
						
						var state = $state.$current;
						while (state !== undefined) {
							stateHierarchy.push(state);
							state = state['parent'];
						}
						
						// clean-out rootScope before re-building
						$rootScope['$uiStateData'] = {};
						// store the hierarchy for abritrary access
						$rootScope['$uiStateData']['$hierarchy'] = stateHierarchy.slice(0).reverse();
						// will get all states that define a title
						$rootScope['$uiStateData']['$breadCrumb'] = <angular.ui.IResolvedState[]>[];
						while (stateHierarchy.length > 0) {
							var current = stateHierarchy.pop();
							var currentData = current.locals.globals.hasOwnProperty('$uiStateData') ?
								current.locals.globals['$uiStateData'] : {};

							angular.extend($rootScope['$uiStateData'], currentData);
							
							if (currentData.hasOwnProperty('title')) {
								$rootScope['$uiStateData']['$breadCrumb'].push(currentData['title']);
							}
						}
					})
				}]);
		}
	}

	export var module = new UiRouterStateData().createModule();
}
