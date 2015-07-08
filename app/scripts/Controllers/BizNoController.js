/*jslint node: true */
/* global angular: false */

var BizNoController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage, $location, LoginService, BizNoService) {
	//Get User menu based on roles
	$scope.getUserMenu = LoginService.loadMenu();

	//check authentication
	var token = TokenStorage.retrieve();
	$rootScope.authenticated = false;
	if (token) {
		token = JSON.parse(atob(token.split('.')[0]));
		$rootScope.authenticated = true;
		$rootScope.loggedInUser = token.usrName;
		$scope.getUserMenu();
	} else {
		$location.path('/login');
	}

	//Show Menu Buttons
	$rootScope.hamburgerAvailable = true;
	$rootScope.menuAvailable = true;

	//Inject Service Methods in scope
	$scope.getBusinessNumbers = BizNoService.listBusinessNumbers();
	$scope.saveBiz = BizNoService.save();

	//Biz Controller Form
	$scope.form = {};

	//Toast Position
	$scope.toastPosition = {
		bottom: false,
		top: true,
		left: false,
		right: true
	};

	//Get Toast
	$scope.getToastPosition = function() {
		return Object.keys($scope.toastPosition)
			.filter(function(pos) {
				return $scope.toastPosition[pos];
			})
			.join(' ');
	};

	//Show Toast
	$scope.showToast = function(message) {
		$mdToast.show(
			$mdToast.simple()
			.content(message)
			.position($scope.getToastPosition())
			.hideDelay(5000)
		);
	};

	//Alerts
	$scope.alert = "";
	$scope.showAlert = function(status, message) {
		$mdDialog.show(
			$mdDialog.alert()
			.title("Error " + status)
			.content(message)
			.ariaLabel('Error Notification')
			.ok('Ok')
			// .targetEvent(ev)
		);
	};

	//Error Handling
	$scope.handleError = function(data, status, headers, config) {
		var msg = data === null ? "Message Unavailable" : data.message;
		if (status === 401) { //unauthorized
			$scope.showAlert(status, msg + redirectMsg);
			location.path('/login');
		} else if (status === 403) { //forbidden
			$scope.showAlert(status, msg + forbiddenMsg);
		} else {
			$scope.showAlert(status, msg);
		}
	};


	//Save Business Number
	$scope.save = function(biz) {
		console.log($scope.form);
		if ($scope.form.bizNoForm.$valid) {
			$scope.saveBiz(biz)
				.success(function(data, status, headers, config) {
					$scope.showToast(data.message);
					$scope.resetForm();
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}
	};

	$scope.resetForm = function() {
		$scope.biz = {};
	};


	//Business Number Table
	$scope.tableParams = new ngTableParams({
		page: 1, //Show First page
		count: 10 //count per page
	}, {
		total: 0, //length of data
		getData: function($defer, params) {
			//Ajax Request to API
			$scope.getBusinessNumbers(params)
				.success(function(data, status, headers, config) {
					var rData = {};
					rData = data.payload;
					var bizNos = rData.content;
					params.total(rData.totalElements);
					//set New Data
					$defer.resolve(bizNos);
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}
	});
};

module.exports = BizNoController;