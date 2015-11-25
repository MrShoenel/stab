/// <reference path="../../../typings/angularjs/angular.d.ts" />

module Blog {
	export var BindHtmlCompileDirective: angular.IDirectiveFactory = ($compile: angular.ICompileService): angular.IDirective => {
		return {
			restrict: 'A',
			link: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes) => {
				var endWatch = scope.$watch(() => {
					return scope.$eval(attrs['bindHtmlCompile']);
				}, (value: any) => {
					element.html(value && value.toString());
					
					var compileScope = scope;
					if (attrs['bindHtmlScope']) {
						compileScope = scope.$eval(attrs['bindHtmlScope']);
					}
					$compile(element.contents())(compileScope);
					// Compile only once
					endWatch();
				});
			}
		};
	}
	
	BindHtmlCompileDirective.$inject = ['$compile'];
	angular.module('blogapp').directive('bindHtmlCompile', BindHtmlCompileDirective);
}