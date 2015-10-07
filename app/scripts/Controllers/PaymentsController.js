/*jslint node: true */
/* global angular: false */
var PaymentsController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage, $location, $routeParams, LoginService, $window, PaymentsService) {
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

	// console.log("Paybill Maker: "+$scope.isPaybillMaker);
	// console.log("Paybill Checker: "+$scope.isPaybillChecker);

	//Show Menu Buttons
	$rootScope.hamburgerAvailable = true;
	$rootScope.menuAvailable = true;

	//Inject Service Methods into scope
	$scope.getPayments = PaymentsService.getPayments();
	$scope.getPayment = PaymentsService.getPaymentById();
	$scope.getPaymentByMpesaTxCode = PaymentsService.getPaymentByMpesaTxCode();
	$scope.updatePayment = PaymentsService.updatePayment();
	$scope.getPendingAdjustments = PaymentsService.getPendingAdjustments();
	$scope.getClosedAdjustments = PaymentsService.getClosedAdjustments();
	$scope.confirmApproval = PaymentsService.approveRequest();
	$scope.rejectApproval = PaymentsService.rejectRequest();

	//form
	$scope.form = {};



	//initialize payment
	if ($routeParams.paymentId !== undefined) {
		//Get Payment
		$scope.getPayment($routeParams.paymentId)
			.success(function(data, status, headers, config) {
				$scope.payment = data.payload;
			})
			.error(function(data, status, headers, config) {
				$scope.handleError(data, status, headers, config);
			});
	}

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


	//Update Transaction
	$scope.updateTx = function(payment) {
		if ($scope.form.txForm.$valid) {
			console.log("Reverse: " + payment.reverse);
			$scope.updatePayment(payment)
				.success(function(data, status, headers, config) {
					$scope.payment = data.payload;
					$scope.showToast(data.message);
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}
	};

	//Approve Request
	$scope.approveRequest = function(ev, txLog) {
		// Appending dialog to document.body to cover sidenav in docs app
		var confirm = $mdDialog.confirm()
			.title('Approve Request')
			.content('Are you sure you want to approve this request?')
			.ariaLabel('approve')
			.ok('Yes')
			.cancel('Cancel')
			.targetEvent(ev);
		$mdDialog.show(confirm).then(function() {
			$scope.confirmApproval(txLog)
				.success(function(data, status, headers, config) {
					$scope.showToast(data.message);
					$scope.txLogParams_pending.reload();
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}, function() {
			// $scope.status = 'You decided to keep your debt.';
		});
	};

	//Reject Request
	$scope.rejectRequest = function(ev, txLog) {
		// Appending dialog to document.body to cover sidenav in docs app
		var confirm = $mdDialog.confirm()
			.title('Reject Request')
			.content('Are you sure you want to reject this request?')
			.ariaLabel('reject')
			.ok('Yes')
			.cancel('Cancel')
			.targetEvent(ev);
		$mdDialog.show(confirm).then(function() {
			$scope.rejectApproval(txLog)
				.success(function(data, status, headers, config) {
					$scope.showToast(data.message);
					$scope.txLogParams.reload();
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}, function() {
			// $scope.status = 'You decided to keep your debt.';
		});
	};

	$scope.showPaymentDetails = function(ev, mpesaTxCode,requestedChange) {
		$scope.getPaymentByMpesaTxCode(mpesaTxCode)
			.success(function(data, status, headers, config) {
				// $scope.payment = data.payload;
				var pmt = data.payload;
				pmt.requestedAction = requestedChange;
				console.log(JSON.stringify(pmt));
				$mdDialog.show({
					controller: PaymentDetailsDialogController,
					templateUrl: 'views/Payments/partial-payment-details-diag.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: true,
					locals: {payment:pmt}
				});
			})
			.error(function(data, status, headers, config) {
				$scope.handleError(data, status, headers, config);
			});
	};

	function PaymentDetailsDialogController($scope, $mdDialog,payment) {
		$scope.payment = payment;
		$scope.hide = function() {
			$mdDialog.hide();
		};

		$scope.cancel = function() {
			$mdDialog.cancel();
		};
	}

	//Payments Table
	$scope.tableParams = new ngTableParams({
		page: 1, //Show First page
		count: 10 //count per page
	}, {
		total: 0, //length of data
		getData: function($defer, params) {
			//Ajax Request to API
			$scope.getPayments(params)
				.success(function(data, status, headers, config) {
					var rData = {};
					rData = data.payload;
					var payments = rData.content;
					params.total(rData.totalElements);
					//set New Data
					$defer.resolve(payments);
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}
	});

	//Pending Adjustments
	$scope.txLogParams_pending = new ngTableParams({
		page: 1, //Show First page
		count: 10 //count per page
	}, {
		total: 0, //length of data
		getData: function($defer, params) {
			//Ajax Request to API
			$scope.getPendingAdjustments(params)
				.success(function(data, status, headers, config) {
					var rData = {};
					rData = data.payload;
					var txLogs = rData.content;
					params.total(rData.totalElements);
					//set New Data
					$defer.resolve(txLogs);
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}
	});

		//Closed Adjustments
	$scope.txLogParams_closed = new ngTableParams({
		page: 1, //Show First page
		count: 10 //count per page
	}, {
		total: 0, //length of data
		getData: function($defer, params) {
			//Ajax Request to API
			$scope.getClosedAdjustments(params)
				.success(function(data, status, headers, config) {
					var rData = {};
					rData = data.payload;
					var txLogs = rData.content;
					params.total(rData.totalElements);
					//set New Data
					$defer.resolve(txLogs);
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}
	});


};

module.exports = PaymentsController;