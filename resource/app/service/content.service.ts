/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../app.common.ts" />

module Blog.Service {
	
	/**
	 * The service that provides data to controllers.
	 */
	export class ContentService {
		
		private metaArticles: Common.MetaArticle[] = null;
		
		private topMetaArticles: Common.MetaArticle[] = [];
		
		private metaCache: angular.ICacheObject;
		
		private cache: angular.ICacheObject;
		
		/**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['$http', '$q', '$cacheFactory', ContentService];
		
		public constructor(private $http: angular.IHttpService, private $q: angular.IQService, private $cacheFactoryService: angular.ICacheFactoryService) {
			this.metaCache = $cacheFactoryService('contentMeta');
			this.cache = $cacheFactoryService('content');
		}
		
		public initializeMetaContent(): angular.IPromise<Common.MetaArticle[]> {
			return this.$http.get<Common.MetaArticle[]>('content/content.json').then(metaArts => {
				this.topMetaArticles = metaArts.data.filter(ma => ma.path.indexOf('content/top') !== -1);
				this.metaArticles = metaArts.data.filter(ma => this.topMetaArticles.indexOf(ma) < 0);

				for (let i = 0; i < metaArts.data.length; i++) {
					this.metaCache.put(metaArts.data[i].urlName, metaArts.data[i]);
				}
				
				return metaArts.data;
			});
		}
		
		public articleByUrlName(urlName: string): angular.IPromise<angular.IAugmentedJQuery> {
			var article = this.cache.get<angular.IAugmentedJQuery>(urlName);
			
			return article === undefined ? this.getMetaArticles().then(metaArts => {
				return this.$http.get<string>(this.metaCache.get<Common.MetaArticle>(urlName).path).then(arg => {
					var $article = angular.element(arg.data);
					this.cache.put(urlName, $article);
					return $article;
				});
			}) : this.$q.when(article);
		}
		
		public getMetaArticles(): angular.IPromise<Common.MetaArticle[]> {
			return this.metaArticles === null ? this.initializeMetaContent().then(() => {
				return this.metaArticles.slice(0);
			}) : this.$q.when(this.metaArticles.slice(0));
		}
		
		public getTopMetaArticles(): angular.IPromise<Common.MetaArticle[]> {
			return this.metaArticles === null ? this.initializeMetaContent().then(() => {
				return this.topMetaArticles.slice(0);
			}) : this.$q.when(this.topMetaArticles.slice(0));
		}
	}
	
	angular.module('blogapp').service('ContentService', ContentService.inlineAnnotatedConstructor);
}
