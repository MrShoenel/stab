/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="../../app.common.ts" />
/// <reference path="./listStrategies.ts" />
/// <reference path="../service/content.service.ts" />

module Blog.ArticleList {

	export class ArticleListController {
		
		public currentPage: Common.Page<Common.MetaArticle>;
		
		public listType: string;
		public sortReverse: boolean;
		public pageIndex: number;
		public inject: Common.IKVStore<string>;
		public searchTerm: string;
		
		public itemsPerPage: number;
		
		/**
		 * Used by the directive's template.
		 */
		public isSearchList: boolean = false;
    
    /**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['ContentService', '$stateParams', '$scope', '$location', 'CONFIG', ArticleListController];
		
		public constructor(private ContentService: Blog.Service.ContentService, private $stateParams: angular.ui.IStateParamsService, private $scope: angular.IScope, private $location: angular.ILocationService, private CONFIG: Common.Constants) {
			
			this.listType = $scope['listType'] || $stateParams['listType'];
			this.isSearchList = this.listType.indexOf('search') !== 1;
			this.sortReverse = $scope['sortReverse'] === 'true';
			this.pageIndex = $scope['sortReverse'] ?
				parseInt($scope['sortReverse']) : <number>$stateParams['pageIdx'] || 0;
			this.inject = ArticleListController.parseInject($scope['inject'] || '');
			this.searchTerm = this.$location.search()['q'];
			this.itemsPerPage = CONFIG.get<number>('ITEMS_PER_PAGE', 5);
			
			this.ContentService.getMetaArticles().then(metaArts => {
				this.currentPage = Common.Page.partitionAndGetFirstPage(
					this.getStrategy(this.listType, this.sortReverse).itemsList(metaArts), this.itemsPerPage);
				
				// advance to page
				this.advanceToPage();
				
				return metaArts;
			});
			
			if (this.searchTerm) {
				this.search();
			}
		};
		
		/**
		 * Public getter for isSearch.
		 */
		public get isSearch(): boolean {
			return this.isSearchList;
		};
		
		/**
		 * Parses a string of the form "a=b;c=d;.." into a KVStore<string>.
		 * This is useful when multiple values were supposed to be injected.
		 */
		private static parseInject(inject: string): Common.IKVStore<string> {
			inject = (inject + '').trim();
			if (inject.length === 0) {
				return {};
			}

			var kv = <Common.IKVStore<string>>{}, split = inject.split(';');
			split.forEach(spl => {
				var arr = spl.split('=');
				kv[arr[0]] = arr[1];
			});
			return kv;
		};
		
		private advanceToPage(): void {
			var idx = this.pageIndex;
			while (idx-- > 0) {
				this.currentPage = this.currentPage.next;
			}
		};
		
		public search(): void {
			this.$location.search({ q: this.searchTerm });
			this.$scope.$root['$uiStateData']['title'] = 'search' +
				(angular.isString(this.searchTerm) && this.searchTerm.length ? ':' + this.searchTerm : '');
			this.ContentService.getMetaArticles().then(metaArts => {
				this.currentPage = Common.Page.partitionAndGetFirstPage(
					this.getStrategy(this.listType, this.sortReverse).itemsList(metaArts), this.itemsPerPage);
				
				// advance
				this.advanceToPage();
			});
		};
		
		public gotoPrevPage(): void {
			this.currentPage = this.currentPage.prev;
		};
		
		public gotoNextPage(): void {
			this.currentPage = this.currentPage.next;
		};
		
		private getStrategy(listType: string = 'all', sortReverse: boolean = false, throwIfNone = false): Common.AListStrategy {
			
			var allStratgiesNames: string[] = Object.keys(ArticleList).filter(key => {
				return typeof ArticleList[key]['canHandle'] === 'function' &&
					new ArticleList[key]() instanceof Common.AListStrategy &&
					ArticleList[key]['canHandle'](listType);
			});
			
			if (allStratgiesNames.length === 0) {
				if (throwIfNone) {
					throw new Error('Unknown list-type strategy: ' + listType);
				} else {
					return new ListAllStrategy(listType, sortReverse);
				}
			}
			
			
			var strategy = <Common.AListStrategy>new ArticleList[allStratgiesNames[0]](listType, sortReverse);
			// Now inject things
			var search = this.$location.search();
			if (search.hasOwnProperty('q')) {
				strategy.inject('locationSearch', search['q']);
			}
			for (const key in this.inject) {
				strategy.inject(key, this.inject[key]);
			}
			
			return strategy;
		};
  }

  angular.module('blogapp').controller('ArticleListController', ArticleListController.inlineAnnotatedConstructor);
}
