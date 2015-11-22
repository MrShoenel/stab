/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../app.common.ts" />

module Blog.Service {
	
	/**
	 * The service that provides data to controllers.
	 */
	export class ContentService {
		
		private metaArticles: Common.MetaArticle[] = null;
		
		private metaCache: angular.ICacheObject;
		
		private cache: angular.ICacheObject;
		
		/**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['$http', '$q', '$cacheFactory', '$sce', ContentService];
		
		public constructor(private $http: angular.IHttpService, private $q: angular.IQService, private $cacheFactoryService: angular.ICacheFactoryService, private $sce: angular.ISCEService) {
			this.metaCache = $cacheFactoryService('contentMeta');
			this.cache = $cacheFactoryService('content');
		};
		
		/**
		 * Used to initialize the meta-content. That means it will load
		 * the content.json which gives us information about all the
		 * available content.
		 */
		public initializeMetaContent(): angular.IPromise<Common.MetaArticle[]> {
			return this.$http.get<Common.MetaArticle[]>('content/content.json').then(metaArts => {
				if (this.metaArticles !== null) {
					return this.$q.when(this.metaArticles.slice(0));
				}

				this.metaArticles = metaArts.data;
				
				for (let i = 0; i < metaArts.data.length; i++) {
					this.metaCache.put(metaArts.data[i].urlName, metaArts.data[i]);
				}
				
				return metaArts.data;
			});
		};
		
		/**
		 * Gets one Article by its URL-name. Uses caching internally.
		 */
		public articleByUrlName(urlName: string): angular.IPromise<Common.Article> {
			var article = this.cache.get<Common.Article>(urlName);
			
			return article === undefined ? this.getMetaArticles().then(metaArts => {
				return this.$http.get<string>(this.metaCache.get<Common.MetaArticle>(urlName).path).then(arg => {
					var article = new Common.Article(
						this.metaCache.get<Common.MetaArticle>(urlName), arg.data, this.$sce);

					this.cache.put(urlName, article);
					return article;
				});
			}) : this.$q.when(article);
		};
		
		/**
		 * This function returns all MetaArticles. The optional argument filter allows
		 * to return a filtered subset of all articles.
		 * 
		 * @param filter if the filter is a 2Tuple, then its t1 is used for specifying
		 *  the meta tag to compare with and its t2 is used for the comparison. So if
		 *  you were to provide <"displayat", "topnav"> then only those articles which
		 *  have the meta-tag "displayat" with the value "topnav" would be returned.
		 *  If the provided filter is a function, then it will be given each MetaArticle
		 *  and must return true or false.
		 */
		public getMetaArticles(filter?: Common.I2Tuple<string, string>|((metaArticle:Common.MetaArticle) => boolean)): angular.IPromise<Common.MetaArticle[]> {
			
			var postFilter = filter instanceof Common.I2Tuple ?
				(metaArt: Common.MetaArticle) => metaArt.hasOwnProperty(filter.t1) && metaArt[filter.t1] === filter.t2 :
				(filter instanceof Function ? filter : (dummy: Common.MetaArticle) => true);
			var dateMethod = Date.prototype['toGMTString'] || Date.prototype.toLocaleString || Date.prototype.toString;
			
			return this.metaArticles === null ? this.initializeMetaContent().then(() => {
				return this.metaArticles.slice(0).filter(postFilter).map(metaArt => {
					metaArt.lastMod = dateMethod.call(new Date(Date.parse(metaArt.lastMod)));
					return metaArt;
				});
			}) : this.$q.when(this.metaArticles.slice(0).filter(postFilter));
		}
	};
	
	angular.module('blogapp').service('ContentService', ContentService.inlineAnnotatedConstructor);
}
