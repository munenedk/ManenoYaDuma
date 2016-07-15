/*jslint node: true */
/* global angular: false */
var CardController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage, $location, $routeParams, LoginService, CardService, AlertUtils) {
	//Inject service methods
	$scope.getUserMenu = LoginService.loadMenu();
	$scope.saveCard = CardService.save();
	$scope.getCard = CardService.getCard();
	$scope.updateCard = CardService.updateCard();
	$scope.getCards = CardService.listCards();
	$scope.approveRequest = CardService.approveRequest();
	$scope.rejectRequest = CardService.rejectRequest();
	$scope.isSessionActive = TokenStorage.isSessionActive();
	$scope.showToast = AlertUtils.showToast();
	$scope.showAlert = AlertUtils.showAlert();
	$scope.handleError = AlertUtils.handleError();

	//Get User Token
	var token = TokenStorage.retrieve();

	//User Roles Variables
	$rootScope.authenticated = false;
	$scope.isPaybillChecker = false;
	$rootScope.authenticated = false;


	if ($scope.isSessionActive(token) === true) {
		var user = JSON.parse(atob(token.split('.')[0]));
		$rootScope.authenticated = true;
		$rootScope.loggedInUser = user.usrName;
		$scope.getUserMenu();

		//Check if is Paybill Maker or checker
		var authorities = user.authorities;
		var auths = [];
		for (var i in authorities) {
			// console.log(authorities[i].authority);
			auths.push(authorities[i].authority);
		}

		//Evaluate Roles
		$scope.isPaybillMaker = auths.indexOf('ROLE_PAYBILL_MAKER') > -1;
		$scope.isPaybillChecker = auths.indexOf('ROLE_PAYBILL_CHECKER') > -1;

		//initialize Card
		if ($routeParams.cardId !== undefined) {
			//Get Company
			$scope.getCard($routeParams.cardId)
				.success(function(data, status, headers, config) {
					$scope.card = data.payload;
					$scope.showToast(data.message);
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}

		//Card Table
		$scope.tableParams = new ngTableParams({
			page: 1, //Show First page
			count: 10 //count per page
		}, {
			total: 0, //length of data
			getData: function($defer, params) {
				//Ajax Request to API
				$scope.getCards(params)
					.success(function(data, status, headers, config) {
						var rData = {};
						rData = data.payload;
						var cards = rData.content;
						params.total(rData.totalElements);
						//set New Data
						$defer.resolve(cards);
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
	$rootScope.menuAvailable = false;

	//Form
	$scope.form = {};

	//Save Card
	$scope.save = function(card) {
		if ($scope.form.cardForm.$valid) {
			$scope.saveCard(card)
				.success(function(data, status, headers, config) {
					$scope.showToast(data.message);
					$scope.resetForm();
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}
	};

	//Update Card
	$scope.update = function(card) {
		if ($scope.form.cardForm.$valid) {
			$scope.updateCard(card)
				.success(function(data, status, headers, config) {
					$scope.card = data.payload;
					$scope.showToast(data.message);
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}
	};

	$scope.resetForm = function() {
		$scope.card = {};
	};

	//Approve card
	$scope.approveCard = function(ev, card) {
		// Appending dialog to document.body to cover sidenav in docs app
		var confirm = $mdDialog.confirm()
			.title('Approve Card')
			.content('Are you sure you want to approve this card?')
			.ariaLabel('approve')
			.ok('Yes')
			.cancel('Cancel')
			.targetEvent(ev);
		$mdDialog.show(confirm).then(function() {
			$scope.approveRequest(card)
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

	//Reject card
	$scope.rejectCard = function(ev, card) {
		// Appending dialog to document.body to cover sidenav in docs app
		var confirm = $mdDialog.confirm()
			.title('Reject Card')
			.content('Are you sure you want to reject this card?')
			.ariaLabel('approve')
			.ok('Yes')
			.cancel('Cancel')
			.targetEvent(ev);
		$mdDialog.show(confirm).then(function() {
			$scope.rejectRequest(card)
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

module.exports = CardController;