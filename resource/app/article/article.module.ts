/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/requirejs/require.d.ts" />
/// <reference path="../../../typings/oclazyload/oclazyload.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="./../../app.common.ts" />
/// <reference path="./../../app.config.ts" />

/**
 * This is the main module of the blog.
 */
module Blog.Article {
	export class Article implements Common.IModuleFactory {
		public createModule(): angular.IModule {
			return angular.module('blogapp.article', []);
		}
	};
  
  /**
   * This class will transform internal links which use the notation
   * <a stab-ref="<article-url-name>">..</a> into proper links that
   * can be used to link within articles.
   */
  export class StabArticleLinkContentTransformer implements Common.ContentTransformer {
    public transform(original: string): string {
      return original.replace(/stab-ref="(.*?)"/ig, (substring: string, ref: string) => {
        return 'href="#!/read/' + ref + '"';
      });
    };
  };

	export var module = new Article().createModule();
}
