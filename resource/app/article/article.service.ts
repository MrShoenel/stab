/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../app.common.ts" />

module Blog.Article {
	
	export interface Meta extends Common.IKVStore<any> {
		author?: string;
		copyright?: string;
		description?: string;
		keywords?: string;
		title?: string;
	}
	
	export interface MetaArticle {
		path: string;
		lastMod: string;
		urlName: string;

		meta: Meta;
	}
	
	/**
	 * The service that provides data to controllers.
	 */
	export class ArticleService {
		
		private cache: angular.ICacheObject;
		
		/**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['$http', '$q', '$cacheFactory', ArticleService];
		
		public constructor(private $http: angular.IHttpService, private $q: angular.IQService, private $cacheFactoryService: angular.ICacheFactoryService) {
			this.cache = $cacheFactoryService('articlesMeta');
		}
		
		public initializeMetaContent(): angular.IPromise<any> {
			return this.$http.get<MetaArticle[]>('content/content.json').then(metaArts => {
				for (let i = 0; i < metaArts.data.length; i++) {
					this.cache.put(metaArts.data[i].urlName, metaArts.data[i]);
				}
			});
		}
	}
	
	angular.module('blogapp.article').service('ArticleService', ArticleService.inlineAnnotatedConstructor);
}
