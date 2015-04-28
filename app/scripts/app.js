
/*jslint node: true */
/* global angular: false */

require('angular');
require('angular-animate');
require('angular-aria');
require('angular-material');
require('angular-route');
require('angular-touch');
require('browsernizr');

angular.module('DumaAdmin',['ngMaterial','ngRoute','ngTable']);

var app = angular.module('DumaAdmin');

//controllers
var MainController = require('./Controllers/MainController.js');
var CustomerController =  require('./Controllers/CustomerController.js');

//services
var CustomerService = require('./Services/CustomerService.js');

//Factories
app.factory('CustomerService',CustomerService);


//Inject Controllers
app.controller('MainController',['$scope','$mdSidenav',MainController]);
app.controller('CustomerController',['$scope','$mdDialog','$mdToast','ngTableParams','CustomerService',CustomerController]);

app.config(['$routeProvider','$mdThemingProvider','$httpProvider',function($routeProvider,$mdThemingProvider,$httpProvider){
	//Allow COOhRS
	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common["X-Requested-With"];

	//App Theme
	$mdThemingProvider.theme('default')
	.primaryPalette('light-green')
	.accentPalette('light-blue');

	//Routing
	$routeProvider
	.when('/home',{
		templateUrl: 'views/partial-landing.html'
	})

	.when('/customers',{
		templateUrl:'views/Customer/partial-customers.html',
		controller:'CustomerController'
	})

	.when('/customer/:customerId',{
		templateUrl:'views/Customer/partial-customer.html',
		controller:'CustomerController'
		// resolve:{
			
		// };
	})

	.otherwise({
		redirectTo:'/home'
	});

}]);





