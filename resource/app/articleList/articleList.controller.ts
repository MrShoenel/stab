/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="../../app.common.ts" />
/// <reference path="../service/content.service.ts" />

module Blog.ArticleList {

	export class ArticleListController {
    
    /**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['ContentService', '$stateParams', ArticleListController];
		
		public constructor(private ContentService: Blog.Service.ContentService, private $stateParams: angular.ui.IStateParamsService) {
			this.articlesPage = [];
			this.ContentService.getMetaArticles().then(metaArts => this.articlesPage = metaArts);
			console.log(this.$stateParams);
		}
		
		
		public articlesPage: Common.MetaArticle[];
  }

  angular.module('blogapp').controller('ArticleListController', ArticleListController.inlineAnnotatedConstructor);
}
