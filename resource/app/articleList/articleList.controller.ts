/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="../../app.common.ts" />
/// <reference path="../service/content.service.ts" />

module Blog.ArticleList {

	export class ArticleListController {
		
		public currentPage: Common.Page<Common.MetaArticle>;
    
    /**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['ContentService', '$stateParams', ArticleListController];
		
		public constructor(private ContentService: Blog.Service.ContentService, private $stateParams: angular.ui.IStateParamsService) {
			this.ContentService.getMetaArticles().then(metaArts => {
				metaArts.forEach(metaArt => {
					var method = Date.prototype['toGMTString'] || Date.prototype.toLocaleString || Date.prototype.toString;
					metaArt.lastMod = method.call(new Date(Date.parse(metaArt.lastMod)));
				});
				
				this.currentPage = Common.Page.partitionAndGetFirstPage(
					new ListAllStrategy().itemsList(metaArts), 1);
				
				return metaArts;
			});
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
			return source.sort((a, b) => Date.parse(a.lastMod) > Date.parse(b.lastMod) ? x : y);	
		}
	}

  angular.module('blogapp').controller('ArticleListController', ArticleListController.inlineAnnotatedConstructor);
}
