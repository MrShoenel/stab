/// <reference path="../typings/angularjs/angular.d.ts" />

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
	
	export interface MetaArticle {
		path: string;
		lastMod: string;
		urlName: string;
		title: string;

		meta: Meta;
	}
	
	export class Page<T> {
		
		next: Page<T>;
		prev: Page<T>;
		
		constructor(public items: T[]) {
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
				throw new Error('Nothing to partition!');
			}
			
			var numChunks = Math.ceil(allItems.length / partSize);
			var pages: Page<T1>[] = [];
			
			for (let i = 0; i < numChunks; i++) {
				pages.push(new Page<T1>(allItems.splice(0, partSize)));
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
	export interface IListStrategy<T> {
		type: string;
		reverse: boolean;
		itemsList: (source: T[]) => T[];
	}
	
	export interface IKVStore<T> {
		[key:string]: T;
	}
}
