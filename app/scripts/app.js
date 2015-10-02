/*jslint node: true */
/* global angular: false */
require('angular');
require('angular-animate');
require('angular-aria');
require('angular-route');
require('angular-touch');
require('browsernizr');

angular.module('DumaAdmin', ['ngMaterial', 'ngAnimate', 'ngRoute', 'ngTable', 'angularFileUpload', 'chart.js', 'angular-loading-bar']);

var app = angular.module('DumaAdmin');

//controllers
var MainController = require('./Controllers/MainController.js');
var LoginController = require('./Controllers/LoginController.js');
var CustomerController = require('./Controllers/CustomerController.js');
var UserController = require('./Controllers/UserController.js');
var RolesController = require('./Controllers/RolesController.js');
var PermissionsController = require('./Controllers/PermissionsController.js');
var ReconController = require('./Controllers/ReconController.js');
var PasswordChangeController = require('./Controllers/PasswordChangeController.js');
var MtsSalesController = require('./Controllers/MtsSalesController.js');
var DashboardController = require('./Controllers/DashboardController.js');
var BizNoController = require('./Controllers/BizNoController.js');
var BillingCompanyController = require('./Controllers/BillingCompanyController.js');
var CardController = require('./Controllers/CardController.js');
var PaymentsController = require('./Controllers/PaymentsController.js');
var PaybillReportsController = require('./Controllers/PaybillReportsController.js');

//services
var LoginService = require('./Services/LoginService.js');
var CustomerService = require('./Services/CustomerService.js');
var UserService = require('./Services/UserService.js');
var TokenStorage = require('./Services/TokenStorage.js');
var TokenAuthInterceptor = require('./Services/TokenAuthInterceptor.js');
var RolesService = require('./Services/RolesService.js');
var PermissionsService = require('./Services/PermissionsService.js');
var ReconService = require('./Services/ReconService.js');
var PasswordChangeService = require('./Services/PasswordChangeService.js');
var MtsSalesService = require('./Services/MtsSalesService.js');
var DashboardService = require('./Services/DashboardService.js');
var BizNoService = require('./Services/BizNoService.js');
var BillingCompanyService = require('./Services/BillingCompanyService.js');
var CardService = require('./Services/CardService.js');
var PaymentsService = require('./Services/PaymentsService.js');
var PaybillReportsService = require('./Services/PaybillReportsService.js');

//Factories
app.factory('CustomerService', CustomerService);
app.factory('UserService', UserService);
app.factory('LoginService', LoginService);
app.factory('TokenStorage', TokenStorage);
app.factory('TokenAuthInterceptor', TokenAuthInterceptor);
app.factory('RolesService', RolesService);
app.factory('PermissionsService', PermissionsService);
app.factory('ReconService', ReconService);
app.factory('PasswordChangeService', PasswordChangeService);
app.factory('MtsSalesService', MtsSalesService);
app.factory('DashboardService', DashboardService);
app.factory('BizNoService', BizNoService);
app.factory('BillingCompanyService', BillingCompanyService);
app.factory('CardService', CardService);
app.factory('PaymentsService', PaymentsService);
app.factory('PaybillReportsService', PaybillReportsService);

//Inject Controllers
app.controller('MainController', ['$scope', '$rootScope', '$location', '$mdSidenav', 'TokenStorage', 'LoginService', MainController]);
app.controller('LoginController', ['$scope', '$rootScope', '$mdDialog', '$mdToast', 'LoginService', 'TokenStorage', '$location', '$mdSidenav', LoginController]);
app.controller('CustomerController', ['$scope', '$rootScope', '$mdDialog', '$mdToast', 'ngTableParams', 'CustomerService', '$routeParams', 'TokenStorage', '$location', 'LoginService', CustomerController]);
app.controller('UserController', ['$scope', '$rootScope', '$mdDialog', '$mdToast', 'ngTableParams', 'UserService', 'RolesService', '$routeParams', 'TokenStorage', '$location', 'LoginService', UserController]);
app.controller('RolesController', ['$scope', '$rootScope', '$mdDialog', '$mdToast', 'ngTableParams', 'RolesService', 'PermissionsService', 'TokenStorage', '$location', 'LoginService', RolesController]);
app.controller('PermissionsController', ['$scope', '$rootScope', '$mdDialog', '$mdToast', 'ngTableParams', 'PermissionsService', 'TokenStorage', '$location', 'LoginService', PermissionsController]);
app.controller('ReconController', ['$scope', '$rootScope', '$mdDialog', '$mdToast', 'ngTableParams', 'FileUploader', 'dumaSettings', 'ReconService', 'TokenStorage', '$location', '$routeParams', 'LoginService', ReconController]);
app.controller('PasswordChangeController', ['$scope', '$rootScope', '$mdDialog', '$mdToast', 'dumaSettings', 'PasswordChangeService', 'TokenStorage', '$location', '$routeParams', 'LoginService', PasswordChangeController]);
app.controller('MtsSalesController', ['$scope', '$rootScope', '$mdDialog', '$mdToast', 'ngTableParams', 'TokenStorage', '$location', 'FileUploader', 'dumaSettings', '$routeParams', 'MtsSalesService', 'LoginService', MtsSalesController]);
app.controller('DashboardController', ['$scope', '$rootScope', '$mdDialog', '$mdToast', 'ngTableParams', 'TokenStorage', '$location', 'dumaSettings', 'DashboardService', 'LoginService', DashboardController]);
app.controller('BizNoController', ['$scope', '$rootScope', '$mdDialog', '$mdToast', 'ngTableParams', 'TokenStorage', '$location', '$routeParams', 'LoginService', 'BizNoService', BizNoController]);
app.controller('BillingCompanyController', ['$scope', '$rootScope', '$mdDialog', '$mdToast', 'ngTableParams', 'TokenStorage', '$location', '$routeParams', 'LoginService', 'BillingCompanyService', 'BizNoService','UserService', BillingCompanyController]);
app.controller('CardController', ['$scope', '$rootScope', '$mdDialog', '$mdToast', 'ngTableParams', 'TokenStorage', '$location', '$routeParams', 'LoginService', 'CardService', CardController]);
app.controller('PaymentsController', ['$scope', '$rootScope', '$mdDialog', '$mdToast', 'ngTableParams', 'TokenStorage', '$location', '$routeParams','LoginService', 'PaymentsService', PaymentsController]);
app.controller('PaybillReportsController', ['$scope', '$rootScope', '$mdDialog', '$mdToast', 'ngTableParams', 'TokenStorage', '$location', 'LoginService', '$window','PaybillReportsService', PaybillReportsController]);

//Constants
app.constant('dumaSettings', {
	// "backendUrl": "http://localhost:8282/api/v1/"
		"backendUrl": "http://172.16.17.191:8282/api/v1/"
		// "backendUrl": "http://172.17.74.91:8282/api/v1/"
});

//Configuration
app.config(['$routeProvider', '$locationProvider', '$mdThemingProvider', '$httpProvider', 'ChartJsProvider', function($routeProvider, $locationProvider, $mdThemingProvider, $httpProvider, ChartJsProvider) {
	//Backend Url
	var backendUrl = "";

	//Allow CORS
	$httpProvider.defaults.useXDomain = true;
	// $httpProvider.defaults.withCredentials = true;
	$httpProvider.interceptors.push("TokenAuthInterceptor");
	// delete $httpProvider.defaults.headers.common["X-Requested-With"];
	$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

	// Custom Theme
	var kcbGreenMap = $mdThemingProvider.extendPalette('light-green', {
		'500': '8CC63F'
	});

	var kcbBlueMap = $mdThemingProvider.extendPalette('light-blue', {
		'A200': '00456A', //Accent - primary Color
		// 'A100':'00456A', //hue-1
		'contrastDefaultColor': 'light'

	});

	$mdThemingProvider.definePalette('kcbGreen', kcbGreenMap);
	$mdThemingProvider.definePalette('kcbBlue', kcbBlueMap);


	//App Theme
	$mdThemingProvider.theme('default')
		.primaryPalette('kcbGreen')
		.accentPalette('kcbBlue');

	// Configure all charts
	ChartJsProvider.setOptions({
		colours: ['#FF5252', '#FF8A80'],
		responsive: true
	});
	// Configure all line charts
	ChartJsProvider.setOptions('Line', {
		datasetFill: false
	});
	// Configure all doughnut charts
	ChartJsProvider.setOptions('Doughnut', {
		animateScale: true
	});

	//Routing
	$routeProvider
		.when('/home', {
			templateUrl: 'views/partial-dashboard.html',
			controller: "DashboardController"
		})

	.when('/login', {
		templateUrl: 'views/partial-login.html',
		controller: 'LoginController'
	})

	.when('/customers', {
		templateUrl: 'views/Customer/partial-customers.html',
		controller: 'CustomerController'
	})

	.when('/customer/:customerId', {
		templateUrl: 'views/Customer/partial-customer.html',
		controller: 'CustomerController'
	})

	.when('/users', {
		templateUrl: 'views/User/partial-users.html',
		controller: 'UserController'
	})

	.when('/user', {
		templateUrl: 'views/User/partial-user.html',
		controller: 'UserController'
	})

	.when('/user/:userId', {
		templateUrl: 'views/User/partial-user.html',
		controller: 'UserController'
	})

	.when('/new-user', {
		templateUrl: 'views/User/partial-new-user.html',
		controller: 'UserController'
	})

	.when('/roles', {
		templateUrl: 'views/Role/partial-roles.html',
		controller: 'RolesController'
	})

	.when('/new-role', {
		templateUrl: 'views/Role/partial-new-role.html',
		controller: 'RolesController'
	})

	.when('/permissions', {
		templateUrl: 'views/Permission/partial-permissions.html',
		controller: 'PermissionsController'
	})

	.when('/new-permission', {
		templateUrl: 'views/Permission/partial-new-permission.html',
		controller: 'PermissionsController'
	})

	.when('/mpesaRecon/:reconType', {
		templateUrl: 'views/Mpesa/partial-mpesa-recon.html',
		controller: 'ReconController'
	})

	.when('/mpesaRecon-new/:reconType', {
		templateUrl: 'views/Mpesa/partial-new-mpesa-recon.html',
		controller: 'ReconController'
	})

	.when('/mpesaRecon-file/:reconType/:uploadId', {
		templateUrl: 'views/Mpesa/partial-mpesa-recon-file.html',
		controller: 'ReconController'
	})

	.when('/mpesaRecon-requests/:reconType/:requestUploadId', {
		templateUrl: 'views/Mpesa/partial-mpesa-recon-requests.html',
		controller: 'ReconController'
	})

	.when('/mpesaRecon-status/:reconType/:uploadId', {
		templateUrl: 'views/Mpesa/partial-mpesa-reversal-status.html',
		controller: 'ReconController'
	})


	.when('/password-change/:user', {
		templateUrl: 'views/Utils/partial-password-change.html',
		controller: 'PasswordChangeController'
	})

	.when('/forgot-password', {
		templateUrl: 'views/Utils/partial-forgot-password.html',
		controller: 'PasswordChangeController'
	})

	.when('/mk-ambassadors', {
		templateUrl: "views/MtsSales/partial-ambassador-dash.html",
		controller: 'MtsSalesController'
	})

	.when('/mk-ambassadors-upload', {
		templateUrl: "views/MtsSales/partial-ambassador-new-upload.html",
		controller: "MtsSalesController"
	})

	.when('/mk-ambassadors-file-details/:uploadId', {
		templateUrl: "views/MtsSales/partial-ambassador-file-details.html",
		controller: "MtsSalesController"
	})

	.when('/mts-sales-admin', {
		templateUrl: "views/MtsSales/partial-mts-sales-admin.html",
		controller: "MtsSalesController"
	})

	.when('/bizNos', {
		templateUrl: "views/BizNumbers/partial-biznos.html",
		controller: 'BizNoController'
	})

	.when('/new-bizNo', {
		templateUrl: "views/BizNumbers/partial-new-bizno.html",
		controller: "BizNoController"
	})

	.when('/bizNo/:bizId', {
		templateUrl: "views/BizNumbers/partial-bizno.html",
		controller: "BizNoController"
	})

	.when('/companies', {
		templateUrl: "views/BillingCompany/partial-billing_companies.html",
		controller: "BillingCompanyController"
	})

	.when('/new-company', {
		templateUrl: "views/BillingCompany/partial-new-billing_company.html",
		controller: "BillingCompanyController"
	})

	.when('/company/:companyId', {
		templateUrl: 'views/BillingCompany/partial-billing-company.html',
		controller: 'BillingCompanyController'
	})

	.when('/cards', {
		templateUrl: "views/Cards/partial-cards.html",
		controller: "CardController"
	})

	.when('/new-card', {
		templateUrl: "views/Cards/partial-new-card.html",
		controller: "CardController"
	})

	.when('/card/:cardId', {
		templateUrl: "views/Cards/partial-card.html",
		controller: "CardController"
	})

	.when('/payments', {
		templateUrl: "views/Payments/partial-payments.html",
		controller: "PaymentsController"
	})

	.when('/payments/:paymentId', {
		templateUrl: "views/Payments/partial-payments-edit-failed-transactions.html",
		controller: "PaymentsController"
	})

	.when('/adjusted-payments/',{
		templateUrl:"views/Payments/partial-payments-adjusted.html",
		controller:"PaymentsController"
	})

	.when('/payment-reports', {
		templateUrl: "views/PaybillReports/partial-paybill-reports.html",
		controller: "PaybillReportsController"
	})

	.otherwise({
		redirectTo: '/login'
	});

}]);

//Register listener to watch route changes
app.run(function($rootScope, $location) {
	$rootScope.$on("$routeChangeStart", function(event, next, current) {
		if ($rootScope.loggedInUser === 'undefined' || $rootScope.loggedInUser === null) {
			if (next.templateUrl == "views/partial-login.html") {} else {
				$location.path("/login");
			}
		}

	});
});