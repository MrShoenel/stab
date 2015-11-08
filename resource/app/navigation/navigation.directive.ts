/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />

/**
 * This is the directive for the Main Header Navigation.
 */
module Blog {
	export var AppNavigationDirective: angular.IDirectiveFactory = (): angular.IDirective => {
		return {
			restrict: 'E',
			
			templateUrl: './script/app/navigation/navigation.template.html',
			
			replace: true
		}
	}
	
	AppNavigationDirective.$inject = [];
	angular.module('blogapp').directive('appNavigation', AppNavigationDirective);
}
