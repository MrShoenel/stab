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
		public searchTerm: string;
		
		public itemsPerPage: number;
		
		public isSearch: boolean = false;
    
    /**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['ContentService', '$stateParams', '$scope', '$location', 'CONFIG', ArticleListController];
		
		public constructor(private ContentService: Blog.Service.ContentService, private $stateParams: angular.ui.IStateParamsService, private $scope: angular.IScope, private $location: angular.ILocationService, private CONFIG: Common.Constants) {
			
			this.listType = $scope['listType'] || $stateParams['listType'];
			this.sortReverse = $scope['sortReverse'] === 'true';
			this.pageIndex = $scope['sortReverse'] ? parseInt($scope['sortReverse']) : <number>$stateParams['pageIdx'] || 0;
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
			if (this.listType === 'search') {
				this.isSearch = true;
			}
		};
		
		private advanceToPage(): void {
			var idx = this.pageIndex;
			while (idx-- > 0) {
				this.currentPage = this.currentPage.next;
			}
		};
		
		public search(): void {
			this.$location.search({ q: this.searchTerm });
			this.$scope.$root['$uiStateData']['title'] = 'search:' + this.searchTerm;
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
			
			return strategy;
		};
  }

  angular.module('blogapp').controller('ArticleListController', ArticleListController.inlineAnnotatedConstructor);
}
