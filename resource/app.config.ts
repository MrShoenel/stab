/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/oclazyload/oclazyload.d.ts" />
/// <reference path="../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="./app.common.ts" />
/// <reference path="./app/service/content.service.ts" />
/// <reference path="./app/article/article.controller.ts" />


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
						abstract: true,
						url: '',
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
								template: '<div ui-view></div>'
							}
						},
						resolve: {
							navigation: ($ocLazyLoad: oc.ILazyLoad) => $ocLazyLoad.load({
								name: 'blogapp.navigation',
								files: [
									'./script/app/navigation/navigation.directive.js',
									'./script/app/header/header.directive.js',
									'./script/app/footer/footer.directive.js'
								]
							}),
							services: ['$ocLazyLoad', '$injector', ($ocLazyLoad: oc.ILazyLoad, $injector: angular.auto.IInjectorService) => $ocLazyLoad.load({
									name: 'blogapp.service',
									files: [
										'./script/app/service/content.service.js'
									]
								}).then(() => {
									// This one will make the service initialize itself.
									return $injector.get<Blog.Service.ContentService>('ContentService').initializeMetaContent();
								})
							]
						}
					});
					
					$stateProvider.state('default', {
						parent: 'main',
						url: '/',
						template: '<article-list></article-list>',
						resolve: {
							articleList: ($ocLazyLoad: oc.ILazyLoad) => $ocLazyLoad.load({
								name: 'blogapp.articleList',
								files: [
									'./script/app/articleList/listStrategies.js',
									'./script/app/articleList/articleList.controller.js',
									'./script/app/articleList/articleList.directive.js'
								]
							}),
							$uiStateData: [() => {
								return {
									title: 'home'
								};
							}]
						}
					});

					$stateProvider.state('read', {
						parent: 'main',
						url: '/read/{urlName:.*}',
						controller: 'ArticleController',
						controllerAs: 'vm',
						templateProvider: ['$templateFactory', ($templateFactory: Common.$TemplateFactory) => {
							return $templateFactory.fromUrl('./script/app/article/article.template.html');
						}],
						params: {
							articleUrlName: {
								value: undefined, // there is no default
								squash: false
							}
						},
						resolve: {
							articleModule: ($ocLazyLoad: oc.ILazyLoad) => $ocLazyLoad.load({
								name: 'blogapp.article',
								files: [
										'./script/app/article/article.module.js',
										'./script/app/article/article.controller.js',
										'./script/app/article/htmlCompile.directive.js',
								]
							}),
							// 'services' is from the parent's resolve
							currentArticle: ['$stateParams', 'ContentService', 'services', ($stateParams: angular.ui.IStateParamsService, contentService: Service.ContentService, services: any) => {
								return contentService.articleByUrlName($stateParams['urlName']);
							}],
							$uiStateData: ['currentArticle', (currentArticle: Common.Article) => {
								var am = currentArticle.meta, ho = (prop: string) => am.hasOwnProperty(prop),
									stateData = {
										article: currentArticle,
										title: currentArticle.meta.title,
										meta: [
											['last-modified', new Date(Date.parse(am.lastMod))['toGMTString']()]
										]
									};
								
								['author', 'copyright', 'description', 'keywords'].filter(prop => ho(prop)).forEach(prop => stateData.meta.push([prop, am[prop]]));

								return stateData;
							}]
						}
					});
					
					$stateProvider.state('list', {
						parent: 'main',
						url: '/list/{listType:string}/{pageIdx:int}',
						template: '<article-list></article-list>',
						params: {
							listType: {
								value: 'all',
								squash: false
							},
							pageIdx: {
								value: 0,
								squash: true
							}
						},
						resolve: {
							articleList: ($ocLazyLoad: oc.ILazyLoad) => $ocLazyLoad.load({
								name: 'blogapp.articleList',
								files: [
									'./script/app/articleList/listStrategies.js',
									'./script/app/articleList/articleList.controller.js',
									'./script/app/articleList/articleList.directive.js'
								]
							}),
							$uiStateData: ['$stateParams', ($stateParams: angular.ui.IStateParamsService) => {
								return {
									title: 'dir:/' + $stateParams['listType']
								};
							}]
						}
					});
					
					$stateProvider.state('search', {
						reloadOnSearch: false,
						parent: 'main',
						url: '/search/{pageIdx:int}',
						template: '<article-list list-type="search"></article-list>',
						params: {
							pageIdx: {
								value: 0,
								squash: true
							}
						},
						resolve: {
							articleList: ($ocLazyLoad: oc.ILazyLoad) => $ocLazyLoad.load({
								name: 'blogapp.articleList',
								files: [
									'./script/app/articleList/listStrategies.js',
									'./script/app/articleList/articleList.controller.js',
									'./script/app/articleList/articleList.directive.js'
								]
							}),
							$uiStateData: ['$location', ($location: angular.ILocationService) => {
								var q = $location.search()['q'];
								return {
									title: 'search' + (q ? ':' + q : '')
								};
							}]
						}
					});
				};
			}]);
	}
}
