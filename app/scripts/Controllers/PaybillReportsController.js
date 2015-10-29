/*jslint node: true */
/* global angular: false */

var PaybillReportsController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage, $location, FileSaver, Blob, LoginService, $window, PaybillReportsService,AlertUtils) {
	//Inject Service Methods into scope
	$scope.getUserMenu = LoginService.loadMenu();
	$scope.getBusinessNumbers = PaybillReportsService.getBizNos();
	$scope.getReport = PaybillReportsService.getReport();
	$scope.downloadReport = PaybillReportsService.downloadReport();
	$scope.isSessionActive = TokenStorage.isSessionActive();
	$scope.showToast = AlertUtils.showToast();
	$scope.showAlert = AlertUtils.showAlert();
	$scope.handleError = AlertUtils.handleError();

	//Get user token
	var token = TokenStorage.retrieve();
	$rootScope.authenticated = false;

	//Search progress
	$scope.showSearchProgress = false;

	//Check is there's an active session
	if ($scope.isSessionActive(token) === true) {
		var user = JSON.parse(atob(token.split('.')[0]));
		$rootScope.authenticated = true;
		$rootScope.loggedInUser = user.usrName;
		$scope.getUserMenu();

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
	} else {
		TokenStorage.clear();
		$scope.showToast("Your Session has exprired. You have been redirected to the login page.");
		$location.path('/login');
	}

	//Show Menu Buttons
	$rootScope.hamburgerAvailable = true;
	$rootScope.menuAvailable = true;

	//form
	$scope.form = {};

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
						var fileData = new Blob([data], {
							type: format
						});
						var fileConfig = {
							data: fileData,
							filename: 'C2BReport.' + searchParams.format
						};
						FileSaver.saveAs(fileConfig);
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