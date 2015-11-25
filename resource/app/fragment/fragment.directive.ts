/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="../../app.common.ts" />

/**
 * This is fragment-directive which is used to embed arbitrary
 * fragments into the application.
 */
module Blog {
	export var AppFragmentDirective: angular.IDirectiveFactory = (Config: Common.Constants): angular.IDirective => {
		return {
			restrict: 'E',
			
			template: '<div>' + (Config.get<boolean>('ALLOW_ANGULAR_HTML', false) ?
				'<div bind-html-compile="vm.trustedValue" bind-html-scope="$root"></div>' :
				'<div ng-bind-html="vm.trustedValue" bind-html-scope="$root"></div>') + '</div>',
			
			controllerAs: 'vm',
			controller: 'FragmentController',
			
			replace: true,
			
			scope: {
				id: '@'
			}
		}
	}
	
	AppFragmentDirective.$inject = ['CONFIG'];
	angular.module('blogapp').directive('appFragment', AppFragmentDirective);
}
