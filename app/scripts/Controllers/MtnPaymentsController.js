/*jslint node: true */
/* global angular: false */
var MtsPaymentsController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage, $location, LoginService, MtnPaymentsService, FileSaver, Blob, AlertUtils) {
	//Inject service methods into scope
	$scope.getUserMenu = LoginService.loadMenu();
	$scope.getPayments = MtnPaymentsService.getPayments();
	$scope.downloadPayments = MtnPaymentsService.downloadPayments();
	$scope.isSessionActive = TokenStorage.isSessionActive();
	$scope.showToast = AlertUtils.showToast();
	$scope.showAlert = AlertUtils.showAlert();
	$scope.handleError = AlertUtils.handleError();

	//Get Authentication Token
	var token = TokenStorage.retrieve();
	$rootScope.authenticated = false;

	if ($scope.isSessionActive(token) === true) {
		var user = JSON.parse(atob(token.split('.')[0]));
		$rootScope.authenticated = true;
		$rootScope.loggedInUser = user.usrName;
		$scope.getUserMenu();

		//Download File
		$scope.downloadFile = function() {
			var filter = $scope.tableParams.$params.filter;
			console.log(filter);
			$scope.downloadPayments(filter)
				.success(function(data, status, headers, config) {
					var fileData = new Blob([data], {
						type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;"
					});
					var fileConfig = {
						data: fileData,
						filename: 'MTNReport.xlsx'
					};
					FileSaver.saveAs(fileConfig);
				})
				.error(function(data, status, headers, config) {
					$scope.showAlert(status, "No Report Available For Given Parameters");
				});
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
	} else {
		TokenStorage.clear();
		$scope.showToast("Your Session has exprired. You have been redirected to the login page.");
		$location.path('/login');
	}

	//Show Menu Buttons
	$rootScope.hamburgerAvailable = true;
	$rootScope.menuAvailable = false;
};

module.exports = MtsPaymentsController;