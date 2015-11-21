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
					this.getStrategy(this.listType, this.sortReverse).itemsList(metaArts));
				
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
			
			return new ArticleList[allStratgiesNames[0]](listType, sortReverse);
		}
  }

  angular.module('blogapp').controller('ArticleListController', ArticleListController.inlineAnnotatedConstructor);
}
