/*jslint node: true */
/* global angular: false */
var PaymentsController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage, $location, $routeParams, $window, LoginService, BillingCompanyService, PaymentsService,AlertUtils) {
	//Inject Service Methods into scope
	$scope.getUserMenu = LoginService.loadMenu();
	$scope.getPayments = PaymentsService.getPayments();
	$scope.getPayment = PaymentsService.getPaymentById();
	$scope.getPaymentByMpesaTxCode = PaymentsService.getPaymentByMpesaTxCode();
	$scope.updatePayment = PaymentsService.updatePayment();
	$scope.getPendingAdjustments = PaymentsService.getPendingAdjustments();
	$scope.getClosedAdjustments = PaymentsService.getClosedAdjustments();
	$scope.confirmApproval = PaymentsService.approveRequest();
	$scope.rejectApproval = PaymentsService.rejectRequest();
	$scope.validateAccountNumber = BillingCompanyService.validateAccountNumber();
	$scope.isSessionActive = TokenStorage.isSessionActive();
	$scope.showToast = AlertUtils.showToast();
	$scope.showAlert = AlertUtils.showAlert();
	$scope.handleError = AlertUtils.handleError();

	//Get user token
	var token = TokenStorage.retrieve();

	//Role Variable
	$scope.isPaybillMaker = false;
	$scope.isPaybillChecker = false;
	$rootScope.authenticated = false;

	//Check if there's an active session
	if ($scope.isSessionActive(token) === true) {
		var user = JSON.parse(atob(token.split('.')[0]));
		$rootScope.authenticated = true;
		$rootScope.loggedInUser = user.usrName;
		$scope.getUserMenu();

		//Check if is Paybill Maker or checker
		var authorities = user.authorities;
		var auths = [];
		for (var i in authorities) {
			auths.push(authorities[i].authority);
		}

		//Evaluate Roles
		$scope.isPaybillMaker = auths.indexOf('ROLE_PAYBILL_MAKER') > -1;
		$scope.isPaybillChecker = auths.indexOf('ROLE_PAYBILL_CHECKER') > -1;

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

	//Update Transaction
	$scope.updateTx = function(payment) {
		if ($scope.form.txForm.$valid) {
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

	$scope.showPaymentDetails = function(ev, mpesaTxCode, requestedChange) {
		$scope.getPaymentByMpesaTxCode(mpesaTxCode)
			.success(function(data, status, headers, config) {
				var pmt = data.payload;
				pmt.requestedAction = requestedChange;
				$mdDialog.show({
					controller: PaymentDetailsDialogController,
					templateUrl: 'views/Payments/partial-payment-details-diag.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: true,
					locals: {
						payment: pmt
					}
				});
			})
			.error(function(data, status, headers, config) {
				$scope.handleError(data, status, headers, config);
			});
	};

	$scope.validateAccount = function(accNo) {
		if (accNo !== null) {
			if (accNo.length >= 10) {
				$scope.validateAccountNumber(accNo)
					.success(function(data, status, headers, config) {
						$scope.showToast(data.message);
						$scope.payment.newAccountNumber = data.payload.accountNumber;
						$scope.payment.newAccountName = data.payload.accountTitle;
					})
					.error(function(data, status, headers, config) {
						$scope.handleError(data, status, headers, config);
						$scope.payment.newAccountNumber = null;
						$scope.payment.newAccountName = null;
					});
			}
		}
	};

	function PaymentDetailsDialogController($scope, $mdDialog, payment) {
		$scope.payment = payment;
		$scope.hide = function() {
			$mdDialog.hide();
		};

		$scope.cancel = function() {
			$mdDialog.cancel();
		};
	}
};

module.exports = PaymentsController;