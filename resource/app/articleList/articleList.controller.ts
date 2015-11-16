/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="../../app.common.ts" />
/// <reference path="../service/content.service.ts" />

module Blog.ArticleList {

	export class ArticleListController {
		
		public currentPage: Common.Page<Common.MetaArticle>;
		
		public listType: string;
		public sortReverse: boolean;
		public pageIndex: number;		
    
    /**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['ContentService', '$stateParams', '$scope', ArticleListController];
		
		public constructor(private ContentService: Blog.Service.ContentService, private $stateParams: angular.ui.IStateParamsService, $scope: angular.IScope) {
			
			this.listType = $scope['listType'] || $stateParams['listType'];
			this.sortReverse = $scope['sortReverse'] === 'true';
			this.pageIndex = $scope['sortReverse'] ? parseInt($scope['sortReverse']) : <number>$stateParams['pageIdx'] || 0;
			
			this.ContentService.getMetaArticles().then(metaArts => {
				metaArts.forEach(metaArt => {
					var method = Date.prototype['toGMTString'] || Date.prototype.toLocaleString || Date.prototype.toString;
					metaArt.lastMod = method.call(new Date(Date.parse(metaArt.lastMod)));
				});
				
				this.currentPage = Common.Page.partitionAndGetFirstPage(
					ArticleListController.getStrategy(this.listType, this.sortReverse).itemsList(metaArts));
				
				// advance to page
				var idx = this.pageIndex;
				while (idx-- > 0) {
					this.currentPage = this.currentPage.next;
				}
				
				return metaArts;
			});
		}
		
		public gotoPrevPage(): void {
			this.currentPage = this.currentPage.prev;
		}
		
		public gotoNextPage(): void {
			this.currentPage = this.currentPage.next;
		}
		
		private static getStrategy(listType: string = 'all', sortReverse: boolean = false): Common.IListStrategy<Common.MetaArticle> {
			switch (listType.toLowerCase()) {
				case 'all':
					return new ListAllStrategy();
					break;
				default:
					throw new Error('Unknown list-type strategy: ' + listType);
			}
		}
  }
	
	/**
	 * The default list-strategy that chronologically orders all articles,
	 * newest to oldest.
	 */
	export class ListAllStrategy implements Common.IListStrategy<Common.MetaArticle> {
		type = 'all';
		reverse = false;
		itemsList = (source: Common.MetaArticle[]) => {
			var x = this.reverse ? -1 : 1, y = this.reverse ? 1 : -1;
			return source.sort((a, b) => Date.parse(a.lastMod) < Date.parse(b.lastMod) ? x : y);	
		}
	}

  angular.module('blogapp').controller('ArticleListController', ArticleListController.inlineAnnotatedConstructor);
}
