/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="../../app.common.ts" />
/// <reference path="../service/content.service.ts" />

module Blog.Article {

	export class ArticleController {
		
		public useBindHtmlCompile: boolean;
    
    /**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['$stateParams', 'ContentService', 'CONFIG', ArticleController];
		
		public constructor(
			private $stateParams: angular.ui.IStateParamsService,
			private contentService: Blog.Service.ContentService,
			private Config: Common.Constants
		) {
			this.useBindHtmlCompile = Config.get<boolean>('ALLOW_ANGULAR_HTML', false);
			this.contentService.articleByUrlName(this.$stateParams['articleUrlName']).then(article => {
				this._article = article;
			});
		};
		
		private _article: Common.Article;
		public get article(): Common.Article {
			return this._article;
		};
  }

  angular.module('blogapp.article').controller('ArticleController', ArticleController.inlineAnnotatedConstructor);
}
