/*jslint node: true */
/* global angular: false */
var BillingCompanyController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage, $location, LoginService, BillingCompanyService, BizNoService) {
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

	//Inject Scope Methods
	$scope.getBillingCompanies = BillingCompanyService.listCompanies();
	$scope.saveBillingCompany = BillingCompanyService.save();
	$scope.getAllBizNos = BizNoService.listAllBizNos();

	//Billing Company Form
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


	//Save Billing Company
	$scope.save = function(company) {
		if ($scope.form.billingCompany.$valid) {
			//Add Selected business number
			company.fkbusinessnum = $scope.selectedBizNo;
			$scope.saveBillingCompany(company)
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
		$scope.company = {};
		$scope.bnSearchText = '';
		$scope.bnSelectedItem = undefined;
	};


	//Billing Company Table
	$scope.tableParams = new ngTableParams({
		page: 1, //Show First page
		count: 10 //count per page
	}, {
		total: 0, //length of data
		getData: function($defer, params) {
			//Ajax Request to API
			$scope.getBillingCompanies(params)
				.success(function(data, status, headers, config) {
					var rData = {};
					rData = data.payload;
					var companies = rData.content;
					params.total(rData.totalElements);
					//set New Data
					$defer.resolve(companies);
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}
	});


	/***##### BUSINESS NUMBER SEARCH ######***/
	$scope.bnSimulateQuery = false;
	$scope.bnIsDisabled = false;
	$scope.bnNoCache = false;

	//Load the branches
	var allBizNos = "";
	getBusinessNos();

	// console.log("Load All Method: " + loadAll());
	// console.log(self.branches);
	$scope.bnQuerySearch = querySearch;
	$scope.bnSelectedItemChange = selectedItemChange;
	$scope.bnSearchTextChange = searchTextChange;

	// Branch Query Search
	function querySearch(query) {
		var results = query ? $scope.bnBizNos.filter(createFilterFor(query)) : $scope.bnBizNos,
			deferred;
		if (self.simulateQuery) {
			deferred = $q.defer();
			$timeout(function() {
				deferred.resolve(results);
			}, Math.random() * 1000, false);
			return deferred.promise;
		} else {
			return results;
		}
	}

	function searchTextChange(text) {
		console.log('Text changed to ' + text);
	}

	function selectedItemChange(item) {
		console.log('Item changed to ' + item.value);
		$scope.selectedBizNo = item.value;
	}

	function getBusinessNos() {
		$scope.getAllBizNos()
			.success(function(data, status, headers, config) {
				var res = data.payload;
				for (var i in res) {
					// console.log(res[i]);
					var biz = res[i].accountName + "-" + res[i].businessNumber;
					allBizNos += "," + biz;
				}
				allBizNos = allBizNos.substring(1);
				$scope.bnBizNos = loadAll();
			})
			.error(function(data, status, headers, config) {
				$scope.handleError(data, status, headers, config);
			});
	}


	function loadAll() {
		if (allBizNos !== "") {
			return allBizNos.split(/,+/g).map(function(bizNo) {
				// console.log(bizNo);
				return {
					value: bizNo.toLowerCase(),
					display: bizNo
				};
			});
		} else {
			return null;
		}
	}

	function createFilterFor(query) {
		var lowercaseQuery = angular.lowercase(query);
		return function filterFn(bizNo) {
			return (bizNo.value.indexOf(lowercaseQuery) === 0);
		};
	}

};

module.exports = BillingCompanyController;