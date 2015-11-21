/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../app.common.ts" />

module Blog.ArticleList {
	/**
	 * The default list-strategy that chronologically orders all articles,
	 * newest to oldest.
	 */
	export class ListAllStrategy extends Common.AListStrategy {
		type = 'all';
		reverse = false;
		itemsList = (source: Common.MetaArticle[]) => {
			var x = this.reverse ? -1 : 1, y = this.reverse ? 1 : -1;
			return source.sort((a, b) => Date.parse(a.lastMod) < Date.parse(b.lastMod) ? x : y);	
		};
		
		/**
		 * Override to signal that this strategy can handle the 'all' list-type.
		 */
		static canHandle = (listType: string) => {
			return (listType + '').toLowerCase() === 'all';
		}
	}
	
	
	/**
	 * Another example strategy that lists all meta articles which have
	 * their last modification in the matched year.
	 */
	export class ByYearStrategy extends Common.AListStrategy {
		/**
		 * Returns all articles within the given year (the year was supplied
		 * here in the constructor as the listType-argument).
		 */
		itemsList = (source: Common.MetaArticle[]) => {
			var minTime = Date.parse(this.type),
				maxTimeExcl = Date.parse((parseInt(this.type) + 1).toString());
			var x = this.reverse ? -1 : 1, y = this.reverse ? 1 : -1;
			
			return source.filter(metaArt => {
				var lm = Date.parse(metaArt.lastMod);
				return lm >= minTime && lm < maxTimeExcl;
			}).sort((a, b) => Date.parse(a.lastMod) < Date.parse(b.lastMod) ? x : y);
		}
				
		static canHandle = (listType: string) => {
			return /^2[0-9]{3}$/.test(listType) && !isNaN(Date.parse(listType));
		}
	}
}