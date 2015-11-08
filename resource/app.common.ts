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
	
	export interface IKVStore<T> {
		[key:string]: T;
	}
}
