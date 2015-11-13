/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />

requirejs.config({
	baseUrl: 'script/',
	
	paths: {
		'app': 'app.module',
		'angular': 'lib/angular.min',
		'angular-ui-router': 'lib/angular-ui-router.min',
		'ocLazyLoad': 'lib/oclazyload.require.min',
		'ui-bootstrap': 'lib/ui-bootstrap.min',
		'ui-bootstrap-tpls': 'lib/ui-bootstrap-tpls.min',
		'ui-router-stateData': 'app/ui.router.stateData/ui-router-stateData.module',
		'config': 'app.config',
		'common': 'app.common'
	},
	
	shim: {
		'app': ['angular', 'angular-ui-router', 'ocLazyLoad', 'ui-bootstrap', 'ui-bootstrap-tpls', 'ui-router-stateData', 'config', 'common'],
		'angular-ui-router': ['angular'],
		'ocLazyLoad': ['angular'],
		'ui-bootstrap': ['angular'],
		'ui-bootstrap-tpls': ['ui-bootstrap'],
		'ui-router-stateData': ['angular-ui-router', 'ocLazyLoad']
	}
});

requirejs(['app'], () => {
	angular.bootstrap(document.body, ['blogapp']);
});