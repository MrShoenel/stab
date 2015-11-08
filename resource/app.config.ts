/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/oclazyload/oclazyload.d.ts" />
/// <reference path="../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="./app.common.ts" />
/// <reference path="./app/article/article.service.ts" />


module Blog {
	export function configure(module: angular.IModule) {
		return module.config([
			'$ocLazyLoadProvider', '$locationProvider', '$urlRouterProvider', '$stateProvider', 'DEBUG',
			(	$ocLazyLoadProvider: oc.ILazyLoadProvider,
				$locationProvider: angular.ILocationProvider,
				$urlRouterProvider: angular.ui.IUrlRouterProvider,
				$stateProvider: angular.ui.IStateProvider,
				DEBUG: Common.Constants) => {
				
				$ocLazyLoadProvider.config({
					debug: DEBUG.get<boolean>('oclazyload.debug', false),
					events: false
				});
				
				$locationProvider.hashPrefix('!');
				
				$urlRouterProvider.otherwise('/');
				
				// constants
				configure_constants();
				
				// states
				configure_states();
				
				
				/**
				 * Function that will go through the provided constants and
				 * take the application into the correct state.
				 */
				function configure_constants() {
					// Enable debugging states
					if (DEBUG.get<boolean>('LOG_STATES', false)) {
						module.run(($rootScope: angular.IScope) => {
							$rootScope.$on('$stateChangeError', console.log.bind(console));
						});
					}
				};
				
				/**
				 * Function that will configure the application's states and
				 * views. States use resolve and ocLazyLoad to satisfy their
				 * dependencies.
				 */
				function configure_states() {
					$stateProvider.state('main', {
						url: '/',
						views: {
							navigation: {
								template: '<app-navigation></app-navigation>'
							},
							header: {
								template: '<app-header></app-header>'
							},
							footer: {
								template: '<app-footer></app-footer>'
							},
							// absolute targets the default (nameless) view
							"@": {
								template: '<div ui-view><article-list></article-list></div>'
							}
						},
						resolve: {
							navigation: ($ocLazyLoad: oc.ILazyLoad) => $ocLazyLoad.load({
								name: 'blogapp.navigation',
								files: [
									'./script/app/navigation/navigation.directive.js',
									'./script/app/articleList/articleList.directive.js',
									'./script/app/header/header.directive.js',
									'./script/app/footer/footer.directive.js'
								]
							})
						}
					});
					
					$stateProvider.state('article', {
						parent: 'main',
						url: 'article/{articleUrlName:string}',
						template: '<div ui-view></div>',
						params: {
							articleUrlName: {
								value: null,
								squash: false // must be present
							}
						},
						resolve: {
							articleModule: ['$ocLazyLoad', '$injector', ($ocLazyLoad: oc.ILazyLoad, $injector: angular.auto.IInjectorService) => {
								return $ocLazyLoad.load({
									name: 'blogapp.article',
									files: [
										'./script/app/article/article.module.js',
										'./script/app/article/article.service.js'
									]
								}).then(() => {
									// This one will make the service initialize itself.
									return $injector.get<Blog.Article.ArticleService>('ArticleService').initializeMetaContent();
								});
							}]
						}
					});
					
					$stateProvider.state('page', {
						parent: 'main',
						url: '/page/{pageIdx:number}',
						params: {
							pageIdx: {
								value: 0,
								squash: true
							}
						},
						templateProvider: ($templateFactory: Common.$TemplateFactory) => {
							return $templateFactory.fromUrl('./script/app/checklistOverview/checklistOverview.template.html');
						}
					});
				};
			}]);
	}
}