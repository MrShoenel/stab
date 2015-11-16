module Blog.Article {
	export var BindHtmlCompileDirective: angular.IDirectiveFactory = ($compile: angular.ICompileService): angular.IDirective => {
		return {
			restrict: 'A',
			link: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes) => {
				scope.$watch(() => {
					
				}, (value: any) => {
					element.html(value && value.toString());
					
					var compileScope = scope;
					if (attrs['bindHtmlScope']) {
						compileScope = scope.$eval(attrs['bindHtmlScope']);
					}
					$compile(element.contents())(compileScope);
				});
			}
		};
	}
	
	BindHtmlCompileDirective.$inject = ['$compile'];
	angular.module('blogapp.article').directive('bindHtmlCompile', BindHtmlCompileDirective);
}