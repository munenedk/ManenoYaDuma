/*jslint node: true */
/* global angular: false */
var DashboardController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage, $location, dumaSettings, DashboardService, LoginService) {
	//Inject Service methods to scope
	$scope.getTopAmbassadors = DashboardService.topAmbassadors();
	$scope.getTopRegions = DashboardService.topRegions();
	$scope.getUserMenu = LoginService.loadMenu();

	//Chart Variables
	$scope.topAmbassadorsLabels = [];
	$scope.topAmbassadorsData = [];
	$scope.topRegionsData = [];
	$scope.topRegionsLabels = [];
	// $scope.topAmbassadorsLabels = ["Ted", "John", "Juma", "Ellen", "Tabitha"];
	// $scope.topAmbassadorsData = ["400", "500", "600", "700", "800"];

	//check authentication
	var token = TokenStorage.retrieve();
	$rootScope.authenticated = false;
	if (token) {
		token = JSON.parse(atob(token.split('.')[0]));
		$rootScope.authenticated = true;
		$rootScope.loggedInUser = token.usrName;
		$scope.getUserMenu();

		//Load Chart and Graph Data
		$scope.getTopAmbassadors()
			.success(function(data, status, headers, config) {
				var res = data.payload;
				$scope.ambassadors = res;
				for (var i in $scope.ambassadors) {
					console.log($scope.ambassadors[i]);
					$scope.topAmbassadorsLabels.push($scope.ambassadors[i].name);
					$scope.topAmbassadorsData.push($scope.ambassadors[i].txs);
				}
			})
			.error(function(data, status, headers, config) {
				$scope.handleError(data, status, headers, config);
			});


		$scope.getTopRegions()
			.success(function(data, status, headers, config) {
				var res = data.payload;
				$scope.regions = res;
				for (var i in $scope.regions) {
					console.log($scope.regions[i]);
					$scope.topRegionsLabels.push($scope.regions[i].name);
					$scope.topRegionsData.push($scope.regions[i].txs);
				}
			})
			.error(function(data, status, headers, config) {
				$scope.handleError(data, status, headers, config);
			});
	} else {
		$location.path('/login');
	}

	//Menu
	$rootScope.hamburgerAvailable = true;
	$rootScope.menuAvailable = true;

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

	//Error messages
	var redirectMsg = ". Your session has expired. You will now be redirected";
	var forbiddenMsg = ". You do not have permission to use this resource";

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



};

module.exports = DashboardController;