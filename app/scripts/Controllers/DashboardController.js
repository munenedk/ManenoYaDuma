/*jslint node: true */
/* global angular: false */
var DashboardController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage, $location, dumaSettings, DashboardService, LoginService) {
	//Inject Service methods to scope
	$scope.getTopAmbassadors = DashboardService.topAmbassadors();
	$scope.getTopRegions = DashboardService.topRegions();
	$scope.getUserMenu = LoginService.loadMenu();
	$scope.getTxStatus = DashboardService.getTxStatus();
	$scope.getTxTotals = DashboardService.getTxTotals();

	//Mobi Sales Chart Variables
	$scope.topAmbassadorsLabels = [];
	$scope.topAmbassadorsData = [];
	$scope.topRegionsData = [];
	$scope.topRegionsLabels = [];
	$scope.tomato = true;


	//Paybill Status Chart Variables
	$scope.txStatusData = [];
	$scope.txStatusLabels = [];
	$scope.txStatusSeries = [];
	$scope.txSeriesColors = ["#00CC00", "#FF0000", "#FF9900", "#0000FF", "#996600"];
	$scope.txSeriesOptions = {
		scaleLabel: "<%=Number(value).toLocaleString('en')%>",
		tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= Number(value).toLocaleString('en') %>"
		// multiTooltipTemplate: "<%if (series){%><%=series%>: <%}%><%= Number(value).toLocaleString('en') %>"
	};

	//Paybill Totals Chart variables
	$scope.txTotalLabels = [];
	$scope.txTotalData = [];
	$scope.txTotalSeries = ["Total Amount (KSH)"];
	$scope.txTotalColours = ["#00CC00"];
	$scope.txTotalOptions = {
		scaleLabel: "<%=Number(value).toLocaleString('en')%>",
		tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= Number(value).toLocaleString('en') %>"
	};

	//Dashboar Selectors
	$scope.showMobiSalesDashboard = false;
	$scope.showPaybillDashboard = false;

	//check authentication
	var token = TokenStorage.retrieve();
	$rootScope.authenticated = false;
	if (token) {
		token = JSON.parse(atob(token.split('.')[0]));
		$rootScope.authenticated = true;
		$rootScope.loggedInUser = token.usrName;
		$scope.getUserMenu();

		var mobiRoles = ["ROLE_MTS_ADMINISTRATOR", "ROLE_MTS_SALES_MANAGER", "ROLE_MK_AMBASSADOR", "ROLE_MOBI_DSR", "ROLE_MOBI_STAFF"];
		var paybillRoles = ["ROLE_PAYBILL_MAKER", "ROLE_PAYBILL_CHECKER", "ROLE_PAYBILL_AUDITOR", "ROLE_ADMINISTRATOR"];

		var auths = token.authorities;

		for (var i in auths) {
			console.log(auths[i].authority);
			//Evaluate Mobi Roles
			if (mobiRoles.indexOf(auths[i].authority) > -1) {
				$scope.showMobiSalesDashboard = true;
			}

			//Evaluate Paybill Roles
			if (paybillRoles.indexOf(auths[i].authority) > -1) {
				$scope.showPaybillDashboard = true;
			}
		}

		console.log("showMobiSalesDashboard: " + $scope.showMobiSalesDashboard);
		console.log("showPaybillDashboard: " + $scope.showPaybillDashboard);

		//Populate Mobi Dashboar
		if ($scope.showMobiSalesDashboard === true) {
			//Get Top Ambassadors
			$scope.getTopAmbassadors()
				.success(function(data, status, headers, config) {
					var res = data.payload;
					$scope.ambassadors = res;
					for (var i in $scope.ambassadors) {
						// console.log($scope.ambassadors[i]);
						$scope.topAmbassadorsLabels.push($scope.ambassadors[i].name.split(/\b(\s)/)[0]);
						$scope.topAmbassadorsData.push($scope.ambassadors[i].txs);
					}
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});

			//Get top regions
			$scope.getTopRegions()
				.success(function(data, status, headers, config) {
					var res = data.payload;
					$scope.regions = res;
					for (var i in $scope.regions) {
						// console.log($scope.regions[i]);
						$scope.topRegionsLabels.push($scope.regions[i].name);
						$scope.topRegionsData.push($scope.regions[i].txs);
					}
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}

		//Populate PaybillDashboard
		if ($scope.showPaybillDashboard === true) {
			//Get Transaction Status Summary
			$scope.getTxStatus()
				.success(function(data, status, headers, config) {
					var res = data.payload;
					for (var i in res) {
						$scope.txStatusSeries.push(res[i].status);
						var dataArray = [];
						for (var j in res[i].summary) {
							var summary = res[i].summary[j];
							//Push Only Unique Values into Labels Array
							if ($scope.txStatusLabels.indexOf(summary.tranDate) == -1) {
								$scope.txStatusLabels.push(summary.tranDate);
							}
							//Push Total into Array
							dataArray.push(summary.total);
						}
						$scope.txStatusData.push(dataArray);
					}
					console.log(JSON.stringify($scope.txStatusLabels));
					console.log(JSON.stringify($scope.txStatusData));
					console.log(JSON.stringify($scope.txStatusSeries));
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});

			//Get Transaction Totals Summary
			$scope.getTxTotals()
				.success(function(data, status, headers, config) {
					var res = data.payload;
					var dataArray = [];
					for (var i in res) {
						$scope.txTotalLabels.push(res[i].tranDate);
						dataArray.push(Number(res[i].amount));
					}
					$scope.txTotalData.push(dataArray);

					console.log(JSON.stringify($scope.txTotalLabels));
					console.log(JSON.stringify($scope.txTotalData));
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});

		}
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