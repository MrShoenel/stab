/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />

/**
 * This is the directive for the Main Header Navigation.
 */
module Blog {
	export var AppFooterDirective: angular.IDirectiveFactory = (): angular.IDirective => {
		return {
			restrict: 'E',
			
			templateUrl: './script/app/footer/footer.template.html',
			
			replace: true
		}
	}
	
	AppFooterDirective.$inject = [];
	angular.module('blogapp').directive('appFooter', AppFooterDirective);
}
