/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="../service/content.service.ts" />
/// <reference path="../../app.common.ts" />

/**
 * This is the directive for the Main Header Navigation.
 */
module Blog {
	export var AppNavigationDirective: angular.IDirectiveFactory = (): angular.IDirective => {
		return {
			restrict: 'E',
			
			templateUrl: './script/app/navigation/navigation.template.html',
			
			replace: true,
			
			controllerAs: 'vm',
			
			controller: ['ContentService', function(ContentService: Service.ContentService) {
				var that = this;
				this.metaArticles = [];
				
				ContentService.getMetaArticles(new Common.I2Tuple("displayat", "topnav")).then(metaArts => {
					that.metaArticles = metaArts;
				});
			}]
		}
	}
	
	AppNavigationDirective.$inject = [];
	angular.module('blogapp').directive('appNavigation', AppNavigationDirective);
}
