/// <reference path="./articleList.controller.ts" />
/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />

/**
 * This is the directive for the Main Header Navigation.
 */
module Blog.ArticleList {
	export var ArticleListDirective: angular.IDirectiveFactory = (): angular.IDirective => {
		return {
			restrict: 'E',
			
			templateUrl: './script/app/articleList/articleList.template.html',
			
			replace: true,
			
			controllerAs: 'vm',
			controller: 'ArticleListController',
			
			scope: {
				listType: '@',
				sortReverse: '@',
				pageIndex: '@'
			}
		}
	}
	
	ArticleListDirective.$inject = [];
	angular.module('blogapp').directive('articleList', ArticleListDirective);
}
