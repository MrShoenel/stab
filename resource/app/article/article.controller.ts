/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="../../app.common.ts" />
/// <reference path="../service/content.service.ts" />

module Blog.Article {

	export class ArticleController {
		
		public useBindHtmlCompile: boolean;
		
		private article: Common.Article;
		
		public articleHtml: any;
    
    /**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['ContentService', 'CONFIG', ArticleController];
		
		public constructor(private ContentService: Blog.Service.ContentService, private Config: Common.Constants) {
			this.useBindHtmlCompile = Config.get<boolean>('ALLOW_ANGULAR_HTML', false);
		}
  }

  angular.module('blogapp.article').controller('ArticleController', ArticleController.inlineAnnotatedConstructor);
}
