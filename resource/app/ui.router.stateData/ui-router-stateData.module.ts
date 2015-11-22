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
				.run(['$rootScope', '$timeout', '$state', '$window', '$location',
				(
					$rootScope: angular.IRootScopeService, $timeout: angular.ITimeoutService, $state: angular.ui.IStateService, $window: angular.IWindowService, $location: angular.ILocationService
				) => {
					var locationSearch = {};

					$rootScope.$on('$stateChangeStart', () => {
						delete $rootScope['$uiStateData'];
						//save location.search so we can add it back after transition is done
						locationSearch = $location.search();
					});
					
					$rootScope.$on('$stateChangeSuccess',
					(
						event: angular.IAngularEvent, toState: angular.ui.IState, toParams: Common.IKVStore<any>, fromState: angular.ui.IState, fromParams: Common.IKVStore<any>
					) => {
						// Do some checks on the extended state data, if present
						if (toState.data instanceof ExtendedStateData) {
							var esd = <ExtendedStateData>toState.data;
							
							// Restore all query string parameters back to $location.search
							// if the state signalizes that it uses it.
							if (esd.usesLocationSearch()) {
								$location.search(locationSearch);
							}
						}
						
						// In this array we will store all states from this one upwards,
						// and the root state will be the last one in this array. This is
						// important as we'll be building up the $uiStateData bottom to top.
						var stateHierarchy: angular.ui.IResolvedState[] = [];
						
						// Build up hierarchy.
						var state = $state.$current;
						while (state !== undefined) {
							stateHierarchy.push(state);
							state = state['parent'];
						}
						
						// clean-out rootScope before re-building
						$rootScope['$uiStateData'] = {};
						// set the isMobileView variable
						$rootScope['$uiStateData']['isMobileView'] = $window.innerWidth < 768;
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
	
	/**
	 * Helper class to encapsulate a state's data (the data-property)
	 * in a nicer way. The ui-router-stateData module will take certain
	 * actions if a state's data-property is an instance of this class
	 * and has certain values.
	 * The purpose of this class is to tame the <any>-nature of the data-
	 * property and to bring in some conformity.
	 */
	export class ExtendedStateData {
		private data: Common.IKVStore<any>;
		
		public constructor(obj?: Object) {
			this.data = obj || {};
		}
		
		public set(key: string, value: any): ExtendedStateData {
			this.data[key] = value;
			return this;
		}
		
		public get<T>(key: string, defaultIfEmpty?: any): T {
			if (this.data.hasOwnProperty(key)) {
				return this.data[key];
			}
			
			return defaultIfEmpty || undefined;
		}
		
		// What follows are shortcut methods and properties
		private static
			prop_usesLocationSearch = 'usesLocationSearch';
		
		/**
		 * Getter/setter depending on if an argument was supplied
		 */
		public usesLocationSearch(use?: boolean): ExtendedStateData|boolean {
			if (use === void 0) {
				// getter
				return this.get<boolean>(ExtendedStateData.prop_usesLocationSearch, false);
			}
			
			return this.set(ExtendedStateData.prop_usesLocationSearch, use === true);
		}
	}

	export var module = new UiRouterStateData().createModule();
}
