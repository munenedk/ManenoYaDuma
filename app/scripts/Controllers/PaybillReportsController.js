/*jslint node: true */
/* global angular: false */

var PaybillReportsController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage, $location, LoginService, $window, PaybillReportsService) {
	//Get User Menu
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

	//form
	$scope.form = {};

	//Inject Service Methods into scope
	$scope.getBusinessNumbers = PaybillReportsService.getBizNos();
	$scope.getReport = PaybillReportsService.getReport();
	$scope.downloadReport = PaybillReportsService.downloadReport();

	//Search progress
	$scope.showSearchProgress = false;


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

	$scope.reportTypes = [{
		label: "Detailed Transaction Report",
		value: "detailed"
	}, {
		label: "Daily Summary Report",
		value: "summary"
	}];

	//Initialize selects
	angular.element("select").material_select();

	//Initialize Date Pickers
	angular.element(".datepicker").pickadate({
		selectMonths: true,
		selectYears: 15
	});


	//Initialize Business Numbers
	$scope.bizNos = "";
	$scope.getBusinessNumbers()
		.success(function(data, status, headers, config) {
			$scope.bizNos = data.payload;
		})
		.error(function(data, status, headers, config) {
			$scope.handleError(data, status, headers, config);
		});

	//Get Report
	$scope.generateReport = function(searchParams) {
		if ($scope.form.reportForm.$valid) {
			$scope.showSearchProgress = true;
			//HTML
			if (searchParams.format == 'html') {
				$scope.getReport(searchParams)
					.success(function(data, status, headers, config) {
						$scope.showSearchProgress = false;
						$scope.showToast("Report Generated Successfully");
						var payload = data.payload;

						//Open New Window To Display Report 
						$scope.window = $window.open('', '_blank');
						angular.element($scope.window.document.body).append(payload);
					})
					.error(function(data, status, headers, config) {
						$scope.showSearchProgress = false;
						$scope.showAlert(status, "No Report Available For Given Parameters");
					});
			} else { //PDF or EXCEL
				var format = searchParams.format == 'pdf' ? 'application/pdf;' : 'application/vnd.ms-excel;';
				$scope.downloadReport(searchParams)
					.success(function(data, status, headers, config) {
						$scope.showSearchProgress = false;
						$scope.showToast("Report Generated Successfully");
						file = new Blob([data], {
							type: format
						});
						var fileURL = URL.createObjectURL(file);
						var fileName = "C2BReport";
						var anchor = angular.element('#fileDownload');
						anchor.attr({
							href: fileURL,
							target: '_blank',
							download: fileName
						})[0].click();
					})
					.error(function(data, status, headers, config) {
						$scope.showSearchProgress = false;
						$scope.showAlert(status, "No Report Available For Given Parameters");
					});
			}
		} else {
			$scope.showAlert("400", "Select All Necessary Fields");
		}
	};

};

module.exports = PaybillReportsController;