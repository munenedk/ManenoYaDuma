/*jslint node: true */
/* global angular: false */
var MtsPaymentsController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage, $location, LoginService, MtnPaymentsService) {
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


	$scope.getPayments = MtnPaymentsService.getPayments();


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
			location.path('/home');
		} else if (status === 403) { //forbidden
			$scope.showAlert(status, msg + forbiddenMsg);
		} else {
			$scope.showAlert(status, msg);
		}
	};

	//MTN Payments
	$scope.tableParams = new ngTableParams({
		page: 1, //Show first page
		count: 10, //count per page
	}, {
		total: 0,
		getData: function($defer, params) {
			//ajax request to api
			$scope.getPayments(params)
				.success(function(data, status, headers, config) {
					var rData = {};
					rData = data.payload;
					var payments = rData.content;
					params.total(rData.totalElements);
					//set New data
					$defer.resolve(payments);
				})
				.error(function(data, status, headers, config) {
					var msg = "N/A";
					if (data !== null) {
						msg = data.error + " : " + data.message;
					}
					$scope.showAlert(status, msg);
				});
		}
	});


};

module.exports = MtsPaymentsController;