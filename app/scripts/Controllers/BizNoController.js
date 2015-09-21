/*jslint node: true */
/* global angular: false */

var BizNoController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage, $location, $routeParams, LoginService, BizNoService) {
	//Get User menu based on roles
	$scope.getUserMenu = LoginService.loadMenu();

	//check authentication
	var token = TokenStorage.retrieve();
	$rootScope.authenticated = false;
	$scope.isPaybillMaker = false;
	$scope.isPaybillChecker = false;
	if (token) {
		token = JSON.parse(atob(token.split('.')[0]));
		$rootScope.authenticated = true;
		$rootScope.loggedInUser = token.usrName;
		$scope.getUserMenu();

		//Check if is Paybill Maker or checker
		var authorities = token.authorities;
		var auths = [];
		for (var i in authorities) {
			// console.log(authorities[i].authority);
			auths.push(authorities[i].authority);
		}

		//Evaluate Roles
		$scope.isPaybillMaker = auths.indexOf('ROLE_PAYBILL_MAKER') > -1;
		$scope.isPaybillChecker = auths.indexOf('ROLE_PAYBILL_CHECKER') > -1;
	} else {
		$location.path('/login');
	}

	//Show Menu Buttons
	$rootScope.hamburgerAvailable = true;
	$rootScope.menuAvailable = true;

	//Inject Service Methods in scope
	$scope.getBusinessNumbers = BizNoService.listBusinessNumbers();
	$scope.getBusinessNumber = BizNoService.getBizNumber();
	$scope.updateBusinessNumber = BizNoService.updateBizNumber();
	$scope.saveBiz = BizNoService.save();
	$scope.approveRequest = BizNoService.approveRequest();
	$scope.rejectRequest = BizNoService.rejectRequest();

	//Biz Controller Form
	$scope.form = {};

	//initialize Business
	if ($routeParams.bizId !== undefined) {
		//Get Company
		$scope.getBusinessNumber($routeParams.bizId)
			.success(function(data, status, headers, config) {
				$scope.biz = data.payload;
				$scope.showToast(data.message);
			})
			.error(function(data, status, headers, config) {
				$scope.handleError(data, status, headers, config);
			});
	}

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


	//Update Business Number
	$scope.update = function(biz) {
		if ($scope.form.bizNoForm.$valid) {
			$scope.updateBusinessNumber(biz)
				.success(function(data, status, headers, config) {
					$scope.biz = data.payload;
					$scope.showToast(data.message);
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


	//Approve Biz
	$scope.approveBiz = function(ev, biz) {
		// Appending dialog to document.body to cover sidenav in docs app
		var confirm = $mdDialog.confirm()
			.title('Approve Business Number')
			.content('Are you sure you want to approve this Business Number?')
			.ariaLabel('approve')
			.ok('Yes')
			.cancel('Cancel')
			.targetEvent(ev);
		$mdDialog.show(confirm).then(function() {
			$scope.approveRequest(biz)
				.success(function(data, status, headers, config) {
					$scope.showToast(data.message);
					$scope.tableParams.reload();
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}, function() {
			// $scope.status = 'You decided to keep your debt.';
		});
	};


	//Reject biz
	$scope.rejectBiz = function(ev, biz) {
		// Appending dialog to document.body to cover sidenav in docs app
		var confirm = $mdDialog.confirm()
			.title('Reject Company')
			.content('Are you sure you want to reject this company?')
			.ariaLabel('approve')
			.ok('Yes')
			.cancel('Cancel')
			.targetEvent(ev);
		$mdDialog.show(confirm).then(function() {
			$scope.rejectRequest(biz)
				.success(function(data, status, headers, config) {
					$scope.showToast(data.message);
					$scope.tableParams.reload();
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}, function() {
			// $scope.status = 'You decided to keep your debt.';
		});
	};
};

module.exports = BizNoController;