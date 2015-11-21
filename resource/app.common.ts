/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angular-ui-router/angular-ui-router.d.ts" />

/**
 * This file should contain commonly used interfaces and classes.
 */

module Common {
	/**
	 * Each module may implement that interface and its factory method createModule()
	 * is supposed to return the module.
	 */
	export interface IModuleFactory {
		createModule(): angular.IModule;
	}
	
	/**
	 * Class used to encapsulate constants as they're not automagically
	 * populated using TypeScript.
	 */
	export class Constants {
		
		private values: { [key:string]: any };
		
		public constructor() {
			this.values = {};
		}
		
		public add<T>(key: string, value: T): Constants {
			this.values[key] = value;
			return this;
		}
		
		public get<T>(key: string, defaultIfMissing?:T):T {
			return this.values[key] || defaultIfMissing;
		}		
	}
	
	/**
	 * Temporary interface to describe the ui-router's $templateFactory. This is
	 * necessary because this definition is missing from the d.ts.
	 */
	export interface $TemplateFactory {
		fromUrl(url: string): angular.IPromise<string>;
	}
	
	export interface Meta extends Common.IKVStore<any> {
		author?: string;
		copyright?: string;
		description?: string;
		keywords?: string;
	}
	
	export interface MetaArticle extends Meta {
		path: string;
		lastMod: string;
		urlName: string;
		title: string;
	}
	
	export class Article {
		constructor(private _metaArticle: MetaArticle, private _original: string, private $sce: angular.ISCEService) {
		}
		
		public get meta(): MetaArticle {
			return angular.extend({}, this._metaArticle);
		}
		
		public get original(): string {
			return this._original.substr(0);
		}
		
		public get asJQuery(): angular.IAugmentedJQuery {
			return angular.element(this._original);
		}
		
		public get asTrustedHtml(): any {
			var article = Array.prototype.slice.call(this.asJQuery, 0).filter(element => {
				return element instanceof HTMLElement &&
					(<HTMLElement>element).nodeName.toUpperCase() === 'ARTICLE';
			})[0];
			
			return this.$sce.trustAsHtml(angular.element(article).html());
		}
	}
	
	export class Page<T> {
		
		next: Page<T>;
		prev: Page<T>;
		
		constructor(public items: T[], public index: number) {
			this.next = null;
			this.prev = null;
		}
		
		public hasPrev(): boolean {
			return this.prev !== null;
		}
		
		public hasNext(): boolean {
			return this.next !== null;
		}
		
		/**
		 * Takes a number of items and partitions them into pages by the
		 * given chunk-size. All pages are linked together and the first
		 * page is returned.
		 */
		public static partitionAndGetFirstPage<T1>(allItems: T1[], partSize: number = 5): Page<T1> {			
			if (allItems.length === 0) {
				return new Page<T1>([], 0);
			}
			
			var numChunks = Math.ceil(allItems.length / partSize);
			var pages: Page<T1>[] = [];
			
			for (let i = 0; i < numChunks; i++) {
				pages.push(new Page<T1>(allItems.splice(0, partSize), i));
			}
			for (let i = 0; i < numChunks; i++) {
				if (i > 0) {
					pages[i].prev = pages[i - 1];
				}
				if (i < (numChunks - 1)) {
					pages[i].next = pages[i + 1];
				}
			}
			
			return pages[0];
		}
	}
	
	/**
	 * We might want to have different list-sites and each of them requires
	 * different logic or filters.
	 */
	export abstract class AListStrategy {
		constructor(public type: string, public reverse: boolean) { }
		
		/**
		 * This method supposedly returns an ordered array of meta-articles
		 * based on the implemented strategy and given parameters.
		 */
		itemsList: (source: MetaArticle[]) => MetaArticle[];
		/**
		 * Static method that returns false by default. When a specific
		 * list-type is requested, the designated controller will probe
		 * all registered ListStrategies with this method. Each strategy
		 * should override this static method.
		 */
		static canHandle(listType: string): boolean {
			return false;
		};
	}
	
	export class I2Tuple<T1, T2> {
		constructor(private _t1: T1, private _t2: T2) {
		}
		
		public get t1() {
			return this._t1;
		}
		
		public get t2() {
			return this._t2;
		}
	}
	
	export interface IKVStore<T> {
		[key:string]: T;
	}
}
