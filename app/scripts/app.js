
/*jslint node: true */
/* global angular: false */
require('angular');
require('angular-animate');
require('angular-aria');
require('angular-material');
require('angular-route');
require('angular-touch');
require('browsernizr');

angular.module('DumaAdmin',['ngMaterial','ngRoute','ngTable','angularFileUpload','vAccordion']);

var app = angular.module('DumaAdmin');

//controllers
var MainController = require('./Controllers/MainController.js');
var LoginController = require('./Controllers/LoginController.js');
var CustomerController =  require('./Controllers/CustomerController.js');
var UserController = require('./Controllers/UserController.js');
var RolesController = require('./Controllers/RolesController.js');
var PermissionsController = require('./Controllers/PermissionsController.js');
var ReconController = require('./Controllers/ReconController.js');

//services
var LoginService = require('./Services/LoginService.js');
var CustomerService = require('./Services/CustomerService.js');
var UserService = require('./Services/UserService.js');
var TokenStorage = require('./Services/TokenStorage.js');
var TokenAuthInterceptor = require('./Services/TokenAuthInterceptor.js');
var RolesService = require('./Services/RolesService.js');
var PermissionsService = require('./Services/PermissionsService.js');
var ReconService = require('./Services/ReconService.js');

//Factories
app.factory('CustomerService',CustomerService);
app.factory('UserService',UserService);
app.factory('LoginService',LoginService);
app.factory('TokenStorage',TokenStorage);
app.factory('TokenAuthInterceptor',TokenAuthInterceptor);
app.factory('RolesService',RolesService);
app.factory('PermissionsService',PermissionsService);
app.factory('ReconService',ReconService);

//Inject Controllers
app.controller('MainController',['$scope','$rootScope','$location','$mdSidenav',MainController]);
app.controller('LoginController',['$scope','$rootScope','$mdDialog','$mdToast','LoginService','TokenStorage','$location','$mdSidenav',LoginController]);
app.controller('CustomerController',['$scope','$rootScope','$mdDialog','$mdToast','ngTableParams','CustomerService','$routeParams',CustomerController]);
app.controller('UserController',['$scope','$rootScope','$mdDialog','$mdToast','ngTableParams','UserService','RolesService','$routeParams',UserController]);
app.controller('RolesController',['$scope','$rootScope','$mdDialog','$mdToast','ngTableParams','RolesService','PermissionsService',RolesController]);
app.controller('PermissionsController',['$scope','$rootScope','$mdDialog','$mdToast','ngTableParams','PermissionsService',PermissionsController]);
app.controller('ReconController',['$scope','$rootScope','$mdDialog','$mdToast','ngTableParams','FileUploader','dumaSettings','ReconService','TokenStorage','$location','$routeParams',ReconController]);

//Constants
app.constant('dumaSettings',{"backendUrl":"http://172.16.11.213:8090/api/v1/"});

//Configuration
app.config(['$routeProvider','$locationProvider','$mdThemingProvider','$httpProvider',function($routeProvider,$locationProvider,$mdThemingProvider,$httpProvider){
	//Backend Url
	var backendUrl = "";

	//Allow CORS
	$httpProvider.defaults.useXDomain = true;
	// $httpProvider.defaults.withCredentials = true;
	$httpProvider.interceptors.push("TokenAuthInterceptor");
	// delete $httpProvider.defaults.headers.common["X-Requested-With"];
	$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

	// Custom Theme
	var kcbGreenMap = $mdThemingProvider.extendPalette('light-green',{
		'500' : '8CC63F'
	});

	var kcbBlueMap =  $mdThemingProvider.extendPalette('light-blue',{
		'A200':'00456A', //Accent - primary Color
		// 'A100':'00456A', //hue-1
		'contrastDefaultColor': 'light'
		
	});

	$mdThemingProvider.definePalette('kcbGreen',kcbGreenMap);
	$mdThemingProvider.definePalette('kcbBlue',kcbBlueMap);


	//App Theme
	$mdThemingProvider.theme('default')
	.primaryPalette('kcbGreen')
	.accentPalette('kcbBlue');

	//Routing
	$routeProvider
	.when('/home',{
		templateUrl: 'views/partial-login.html',
		controller:'LoginController'
	})

	.when('/customers',{
		templateUrl:'views/Customer/partial-customers.html',
		controller:'CustomerController'
	})

	.when('/customer/:customerId',{
		templateUrl:'views/Customer/partial-customer.html',
		controller:'CustomerController'
	})

	.when('/users',{
		templateUrl:'views/User/partial-users.html',
		controller:'UserController'
	})

	.when('/user',{
		templateUrl:'views/User/partial-user.html',
		controller:'UserController'
	})

	.when('/new-user',{
		templateUrl:'views/User/partial-new-user.html',
		controller:'UserController'
	})

	.when('/roles',{
		templateUrl:'views/Role/partial-roles.html',
		controller:'RolesController'
	})

	.when('/new-role',{
		templateUrl:'views/Role/partial-new-role.html',
		controller:'RolesController'
	})

	.when('/permissions',{
		templateUrl:'views/Permission/partial-permissions.html',
		controller:'PermissionsController'
	})

	.when('/new-permission',{
		templateUrl:'views/Permission/partial-new-permission.html',
		controller:'PermissionsController'
	})

	.when('/mpesaRecon',{
		templateUrl:'views/Mpesa/partial-mpesa-recon.html',
		controller:'ReconController'
	})

	.when('/mpesaRecon-new',{
		templateUrl:'views/Mpesa/partial-new-mpesa-recon.html',
		controller:'ReconController'
	})

	.when('/mpesaRecon-file/:uploadId',{
		templateUrl:'views/Mpesa/partial-mpesa-recon-file.html',
		controller:'ReconController'
	})

  .when('/mpesaRecon-requests/:requestUploadId',{
    templateUrl:'views/Mpesa/partial-mpesa-recon-requests.html',
    controller:'ReconController'
  })

  .otherwise({
    redirectTo:'/home'
  });

}]);

  //Register listener to watch route changes
  app.run(function($rootScope,$location){
    $rootScope.$on("$routeChangeStart",function(event,next,current){
      // console.log($rootScope.loggedInUser);
      if($rootScope.loggedInUser === 'undefined'){
      //User not logged in redirect to login
      if(next.templateUrl == "views/partial-login.html"){
        //Already Redirecting to login
      }else{
        //Not Going to login so redirect to login
        $location.path("/home");
      }
    }

  });
  });





