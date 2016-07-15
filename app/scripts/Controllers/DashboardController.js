/*jslint node: true */
/* global angular: false */
var DashboardController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage, $location, dumaSettings, DashboardService, LoginService, AlertUtils) {
	//Inject Service methods to scope
	$scope.getUserMenu = LoginService.loadMenu();
	$scope.getTopAmbassadors = DashboardService.topAmbassadors();
	$scope.getTopRegions = DashboardService.topRegions();
	$scope.getTxStatus = DashboardService.getTxStatus();
	$scope.getTxTotals = DashboardService.getTxTotals();

	$scope.getThirdPartyTxTotals = DashboardService.getThirdPartyTxTotals();
	$scope.isSessionActive = TokenStorage.isSessionActive();
	$scope.showToast = AlertUtils.showToast();
	$scope.showAlert = AlertUtils.showAlert();
	$scope.handleError = AlertUtils.handleError();

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
		multiTooltipTemplate: "<%if (datasetLabel){%><%=datasetLabel%>: <%}%><%= Number(value).toLocaleString('en') %>"
	};

	//Paybill Totals Chart variables
	$scope.txTotalLabels = [];
	$scope.txTotalData = [];
	$scope.txTotalSeries = ["Total", "C2B", "B2B"];
	$scope.txTotalColours = ["#00CC00", "#0000FF", "#996600"];
	$scope.txTotalOptions = {
		scaleLabel: "<%=Number(value).toLocaleString('en')%>",
		multiTooltipTemplate: "<%if (datasetLabel){%><%=datasetLabel%>: <%}%><%= Number(value).toLocaleString('en') %>"

	};

	//Third Party Totals chart variables
	$scope.thirdPartyTxTotalLabels = [];
	$scope.thirdPartyTxTotalData = [];
	$scope.thirdPartyTxTotalSeries = ["Total"];
	$scope.thirdPartyTxTotalColours = ["#00CC00"];
	$scope.thirdPartyTxTotalOptions = {
		scaleLabel: "<%=Number(value).toLocaleString('en')%>",
		multiTooltipTemplate: "<%if (datasetLabel){%><%=datasetLabel%>: <%}%><%= Number(value).toLocaleString('en') %>"

	};

	//Dashboard Selectors
	$scope.showMobiSalesDashboard = false;
	$scope.showPaybillDashboard = false;
	$scope.showThirdPartyDashboard = false;

	//Get user token
	var token = TokenStorage.retrieve();
	$rootScope.authenticated = false;

	if ($scope.isSessionActive(token) === true) {
		var user = JSON.parse(atob(token.split('.')[0]));
		$rootScope.authenticated = true;
		$rootScope.loggedInUser = user.usrName;
		$scope.getUserMenu();

		var mobiRoles = ["ROLE_MTS_ADMINISTRATOR", "ROLE_MTS_SALES_MANAGER", "ROLE_MK_AMBASSADOR", "ROLE_MOBI_DSR", "ROLE_MOBI_STAFF"];
		var paybillRoles = ["ROLE_PAYBILL_MAKER", "ROLE_PAYBILL_CHECKER", "ROLE_PAYBILL_AUDITOR", "ROLE_ADMINISTRATOR"];
		var thirdPartyRoles = ["ROLE_BILLER_USER"];

		var auths = user.authorities;

		for (var i in auths) {
			//Evaluate Mobi Roles
			if (mobiRoles.indexOf(auths[i].authority) > -1) {
				$scope.showMobiSalesDashboard = true;
			}

			//Evaluate Paybill Roles
			if (paybillRoles.indexOf(auths[i].authority) > -1) {
				$scope.showPaybillDashboard = true;
			}

			//Evaluatute Third Party Roles
			if (thirdPartyRoles.indexOf(auths[i].authority) > -1) {
				$scope.showThirdPartyDashboard = true;
			}
		}

		//Populate Mobi Dashboard
		if ($scope.showMobiSalesDashboard === true) {
			//Get Top Ambassadors
			$scope.getTopAmbassadors()
				.success(function(data, status, headers, config) {
					var res = data.payload;
					$scope.ambassadors = res;
					for (var i in $scope.ambassadors) {
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
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});

			//Get Transaction Totals Summary
			$scope.getTxTotals()
				.success(function(data, status, headers, config) {
					var res = data.payload;
					var c2bArray = [];
					var b2bArray = [];
					var dailyTotalArray = [];
					for (var i in res) {
						$scope.txTotalLabels.push(res[i].tranDate);
						var c2bAmount = Number(res[i].c2bAmount);
						var b2bAmount = Number(res[i].b2bAmount);
						var totalAmt = c2bAmount + b2bAmount;
						dailyTotalArray.push(totalAmt);
						c2bArray.push(c2bAmount);
						b2bArray.push(b2bAmount);
					}
					$scope.txTotalData.push(dailyTotalArray, c2bArray, b2bArray);
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});

		}

		// Populate Third Party Dashboard
		if ($scope.showThirdPartyDashboard === true) {
			//Get Third Party Transaction Totals Summary
			$scope.getThirdPartyTxTotals()
				.success(function(data, status, headers, config) {
					var res = data.payload;
					var amountArray = [];
					for (var i in res) {
						$scope.thirdPartyTxTotalLabels.push(res[i].tranDate);
						var amount = Number(res[i].amount);
						amountArray.push(amount);
					}
					$scope.thirdPartyTxTotalData.push(amountArray);
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}
	} else {
		TokenStorage.clear();
		$scope.showToast("Your Session has exprired. You have been redirected to the login page.");
		$location.path('/login');
	}

	//Menu
	$rootScope.hamburgerAvailable = true;
	$rootScope.menuAvailable = false;
};

module.exports = DashboardController;