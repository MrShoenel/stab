/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../app.common.ts" />

module Blog.Service {
	
	/**
	 * The service that provides data to controllers.
	 */
	export class ContentService {
		
		private metaArticles: Common.MetaArticle[] = null;
		
		private cache: angular.ICacheObject;
		
		/**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['$http', '$q', '$cacheFactory', ContentService];
		
		public constructor(private $http: angular.IHttpService, private $q: angular.IQService, private $cacheFactoryService: angular.ICacheFactoryService) {
			this.cache = $cacheFactoryService('contentMeta');
		}
		
		public initializeMetaContent(): angular.IPromise<any> {
			return this.$http.get<Common.MetaArticle[]>('content/content.json').then(metaArts => {
				this.metaArticles = metaArts.data;
				for (let i = 0; i < metaArts.data.length; i++) {
					this.cache.put(metaArts.data[i].urlName, metaArts.data[i]);
				}
			});
		}
		
		public getMetaArticles(): angular.IPromise<Common.MetaArticle[]> {
			return this.metaArticles === null ? this.initializeMetaContent().then(() => {
				return this.metaArticles;
			}) : this.$q.when(this.metaArticles);
		}
	}
	
	angular.module('blogapp').service('ContentService', ContentService.inlineAnnotatedConstructor);
}
