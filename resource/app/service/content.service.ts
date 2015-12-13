/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/oclazyload/oclazyload.d.ts" />
/// <reference path="../../app.common.ts" />

module Blog.Service {
	
	/**
	 * The service that provides data to controllers.
	 */
	export class ContentService {
		
		private contentJson: Common.ContentJSON = null;
		
		private metaCache: angular.ICacheObject;
		
		private cache: angular.ICacheObject;
		
		private fragmentCache: angular.ICacheObject;
		
		/**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['$http', '$q', '$cacheFactory', '$sce', ContentService];
		
		public constructor(private $http: angular.IHttpService, private $q: angular.IQService, private $cacheFactoryService: angular.ICacheFactoryService, private $sce: angular.ISCEService) {
			this.metaCache = $cacheFactoryService('contentMeta');
			this.cache = $cacheFactoryService('content');
			this.fragmentCache = $cacheFactoryService('fragments');
		};
		
		/**
		 * Used to initialize the meta-content. That means it will load
		 * the content.json which gives us information about all the
		 * available content.
		 */
		public initializeMetaContent(): angular.IPromise<Common.ContentJSON> {
			// If there were two or more calls to this function:
			if (this.contentJson !== null) {
				return this.$q.when(angular.extend({}, this.contentJson));
			}
			return this.$http.get<Common.ContentJSON>('content/content.json').then(contentJson => {
				this.contentJson = contentJson.data;
				
				for (let i = 0; i < contentJson.data.metaArticles.length; i++) {
					this.metaCache.put(contentJson.data.metaArticles[i].urlName, contentJson.data.metaArticles[i]);
				}
				
				return contentJson.data;
			});
		};
		
		/**
		 * Function that loads all the user's dependencies.
		 */
		public loadMyDeps($ocLazyLoad: oc.ILazyLoad): angular.IPromise<void> {
			return this.initializeMetaContent().then(cJson => {
				return $ocLazyLoad.load(cJson.mydeps.map(dep => dep.path));
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
			
			return this.initializeMetaContent().then(() => {
				return this.contentJson.metaArticles.slice(0).filter(postFilter).map(metaArt => {
					metaArt.lastMod = dateMethod.call(new Date(Date.parse(metaArt.lastMod)));
					return metaArt;
				});
			});
		};
		
		/**
		 * Returns all fragments. There are no parameters to this function so we
		 * can implement it as property. Ensures that all returned fragments
		 * have been cached properly.
		 */
		public get fragments(): angular.IPromise<Common.MetaFragment[]> {
			return this.initializeMetaContent().then(contentJson => {
				return this.$q.all(contentJson.metaFragments.map(fragment => {
					return this.getFragmentByID(fragment.id);
				}));
			});
		};
		
		/**
		 * Returns a single fragment by ID. Fragments will be put to the local
		 * cache before they are returned. Subsequent requests to the same ID
		 * will returned the cached fragment.
		 */
		public getFragmentByID(id: string): angular.IPromise<Common.Fragment> {
			return this.initializeMetaContent().then(contentJson => {
				var metaFragment = contentJson.metaFragments.filter(frg => frg.id === id)[0],
					fragment = this.fragmentCache.get<Common.Fragment>(metaFragment.id);
				
				if (fragment !== undefined) {
					return this.$q.when(fragment);
				}
				
				if (!angular.isString(metaFragment.path) || metaFragment.path.length === 0) {
					fragment = new Common.Fragment(metaFragment, (metaFragment.content || '').toString(), this.$sce);
					this.fragmentCache.put(metaFragment.id, fragment);
					return this.$q.when(fragment);
				}
				
				// Ok, we have to load it as the fragment was not embedded.
				return this.$http.get<string>(metaFragment.path).then(mfrgString => {
					fragment = new Common.Fragment(metaFragment, (mfrgString.data + '').toString(), this.$sce);
					this.fragmentCache.put(metaFragment.id, fragment);
					return fragment;
				});
			});
		};
	};
	
	angular.module('blogapp').service('ContentService', ContentService.inlineAnnotatedConstructor);
}
