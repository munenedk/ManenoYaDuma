/*jslint node: true */
/* global angular: false */
var CardController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage, $location, $routeParams, LoginService, CardService) {
	//Get User menu based on roles
	$scope.getUserMenu = LoginService.loadMenu();

	//check authentication
	var token = TokenStorage.retrieve();
	$rootScope.authenticated = false;
	$scope.isPaybillChecker = false;
	$rootScope.authenticated = false;
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

	//Inject service methods
	$scope.saveCard = CardService.save();
	$scope.getCard = CardService.getCard();
	$scope.updateCard = CardService.updateCard();
	$scope.getCards = CardService.listCards();
	$scope.approveRequest = CardService.approveRequest();
	$scope.rejectRequest = CardService.rejectRequest();

	//Form
	$scope.form = {};

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
			$scope.showAlert(status, msg + ". You Are Not Authorized To Use This Resource.");
		} else {
			$scope.showAlert(status, msg);
		}
	};

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