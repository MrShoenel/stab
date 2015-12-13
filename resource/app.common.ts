/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/oclazyload/oclazyload.d.ts" />
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
	
	
	
	/**
	 * Dedicated interface that represents the structure of our global content.json.
	 * It contains meta-articles and meta-fragments and allows us to make extensions
	 * later if required:
	 */
	export interface ContentJSON {
		mydeps: { path: (string|oc.ITypedModuleConfig) }[];
		metaArticles: MetaArticle[];
		metaFragments: MetaFragment[];
	}
	
	export interface Meta extends Common.IKVStore<any> {
		author?: string;
		copyright?: string;
		description?: string;
		keywords?: string;
		score?: number;
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
		protected injected: IKVStore<any> = {};
		
		public constructor(public type: string, public reverse: boolean) { }
		
		/**
		 * This method supposedly returns an ordered array of meta-articles
		 * based on the implemented strategy and given parameters.
		 */
		public itemsList: (source: MetaArticle[]) => MetaArticle[];
		
		/**
		 * This function may be used by a controller to inject parameters such
		 * as search parameters.
		 */
		public inject(key: string, value: any): AListStrategy {
			this.injected[key] = value;
			return this;
		}

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
	
	
	/**
	 * Describes a fragment's meta information.
	 */
	export interface MetaFragment {
		// Must be unique across all fragments
		id: string;
		// The path to load the fragment from. Optional.
		// If the path is not present we expect the fragment
		// to be embedded into the content.json.
		path?: string;
		// If the path coerces to false, content must be
		// present because the fragment ought to be embedded
		// into the content.json. If both coerce to false,
		// content will be set to an empty string.
		content?: any;
		// A hint on how to interpret the fragment. This
		// should be a valid mime-string. Out of the box,
		// Html and json work. If not present or unknown,
		// will be interpreted as text/plain which results
		// in no processing.
		mime?: string;
	}
	
	/**
	 * This class represents a fragment
	 */
	export class Fragment {
		private trusted: any;
		
		private static supportedMimeTypesArray: {
			mime: string, regex: RegExp, sce: string, default?: boolean
		}[] = [
			{ mime: 'css', regex: /css/i, sce: 'css' },
			{ mime: 'html', regex: /(?:html?)|(?:xml)/i, sce: 'html' },
			{ mime: 'js', regex: /(?:js)|(?:javascript)/i, sce: 'js' },
			{ mime: 'text', regex: /(?:text)|(?:plain)/i, sce: 'html', default: true }
		];
		
		constructor(private _meta: MetaFragment, private _original: string, private $sce: angular.ISCEService) {
			// Takes the best match or default if no match for mime:
			var $sceMethod = Fragment.supportedMimeTypesArray.filter(t => t.regex.test(_meta.mime)).concat(Fragment.supportedMimeTypesArray.filter(t => t.hasOwnProperty('default') && t.default === true))[0].sce;
			
			var asJQuery = Array.prototype.slice.call(angular.element(_original), 0);
			var fragmentElem = asJQuery.filter(element => {
				return element instanceof HTMLElement &&
					(<HTMLElement>element).nodeName.toUpperCase() === 'FRAGMENT';
			})[0];
			
			this.trusted = $sce.trustAs($sceMethod, angular.element(fragmentElem).html()); 
		}
		
		public get meta(): MetaFragment {
			return angular.extend({}, this._meta);
		}
		
		/**
		 * Getter for the trusted value of the fragment.
		 */
		public get trustedValue(): any {
			return this.trusted;
		}
		
		public static get supportedMimeTypes(): string[] {
			return Fragment.supportedMimeTypesArray.slice(0).map(t => t.mime);
		}
	}
}
