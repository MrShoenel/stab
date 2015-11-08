/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />

/**
 * This is the directive for the Main Header Navigation.
 */
module Blog {
	export var AppHeaderDirective: angular.IDirectiveFactory = (): angular.IDirective => {
		return {
			restrict: 'E',
			
			templateUrl: './script/app/header/header.template.html',
			
			replace: true
		}
	}
	
	AppHeaderDirective.$inject = [];
	angular.module('blogapp').directive('appHeader', AppHeaderDirective);
}
