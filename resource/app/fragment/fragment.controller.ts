/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="../service/content.service.ts" />

module Blog {

	export class FragmentController {
		
		public trustedValue: any;
    
    /**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['$scope', 'ContentService', FragmentController];
		
		public constructor(private $scope: angular.IScope, private ContentService: Blog.Service.ContentService) {
			this.ContentService.getFragmentByID($scope['id']).then(fragment => {
				this.trustedValue = fragment.trustedValue;
			});
		}
  }

  angular.module('blogapp').controller('FragmentController', FragmentController.inlineAnnotatedConstructor);
}
