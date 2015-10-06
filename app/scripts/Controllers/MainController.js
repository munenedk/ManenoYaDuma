/*jslint node: true */
/* global angular: false */

var MainController = function($scope, $rootScope, $location, $mdSidenav, TokenStorage, LoginService) {
	// var kcbGreen = "#8CC63F";
	var darkBlue = "#00456A";

	$scope.menuItems = [];
	$scope.toggleSideNav = function(menuId) {
		// $mdSidenav(menuId).toggle();
		if ($rootScope.menuAvailable === false) {
			$rootScope.menuAvailable = true;
		} else {
			$rootScope.menuAvailable = false;
		}
	};

	$scope.linkVisible = function(user_auths) {
		var token = TokenStorage.retrieve();
		var visible = false;
		if (token) {
			token = JSON.parse(atob(token.split('.')[0]));

			//Extract Authorities
			var authorities = token.authorities;
			var auths = [];
			for (var i in authorities) {
				auths.push(authorities[i].authority);
			}

			//check if user_auths are valid
			for (var u in user_auths) {
				if (auths.indexOf("ROLE_" + user_auths[u]) > -1) {
					visible = true;
				}
			}
		}
		return visible;
		// return true;
	};

	$scope.$on('changeMenu', function() {

		$scope.menuItems = [{
				"name": "Dashboard",
				"url": "/home",
				"icon": "fa fa-dashboard",
				"ic_color": "fa fa",
				"visible": $scope.linkVisible(["ADMINISTRATOR", "USER"])
			}, {
				"name": "Customers",
				"url": "/customers",
				"icon": "fa fa-users",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["ADMINISTRATOR"])
			}, {
				"name": "Users",
				"url": "/users",
				"icon": "fa fa-user",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["ADMINISTRATOR", "MTS_ADMINISTRATOR"])
			}, {
				"name": "Roles",
				"url": "/roles",
				"icon": "fa fa-cog",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["ADMINISTRATOR", "MTS_ADMINISTRATOR"])
			}, {
				"name": "Permissions",
				"url": "/permissions",
				"icon": "fa fa-cogs",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["ADMINISTRATOR"])
			}, {
				"name": "MK C2B Mpesa Recon",
				"url": "/mpesaRecon/c2b",
				"icon": "fa fa-refresh",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["RECON_MAKER", "RECON_CHECKER", "ADMINISTRATOR"])
			}, {
				"name": "MK B2C Mpesa Recon",
				"url": '/mpesaRecon/b2c',
				"icon": "fa fa-refresh",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["RECON_MAKER", "RECON_CHECKER", "ADMINISTRATOR"])
			}, {
				"name": "MTS Sales",
				"url": "/mk-ambassadors",
				"icon": "fa fa-money",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["MK_AMBASSADOR", "MOBI_DSR", "MOBI_STAFF"])
			}, {
				"name": "MTS Sales Admin",
				"url": "/mts-sales-admin",
				"icon": "fa fa-money",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["MTS_ADMINISTRATOR", "MTS_SALES_MANAGER" ,"ADMINISTRATOR"])
			}, {
				"name": "Business Numbers",
				"url": "/bizNos",
				"icon": "fa fa-list",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["PAYBILL_MAKER", "PAYBILL_CHECKER", "PAYBILL_AUDITOR", "ADMINISTRATOR"])
			}, {
				"name": "Billing Companies",
				"url": "/companies",
				"icon": "fa fa-building",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["PAYBILL_MAKER", "PAYBILL_CHECKER", "PAYBILL_AUDITOR", "ADMINISTRATOR"])
			}, {
				"name": "Cards",
				"url": "/cards",
				"icon": "fa fa-credit-card",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["PAYBILL_MAKER", "PAYBILL_CHECKER", "PAYBILL_AUDITOR", "ADMINISTRATOR"])
			}, {
				"name": "C2B Payments",
				"url": "/payments",
				"icon": "fa fa-money",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["PAYBILL_MAKER", "PAYBILL_CHECKER", "PAYBILL_AUDITOR", "ADMINISTRATOR"])
			}, {
				"name": "Pending Changes",
				"url": "/pending-adjustments",
				"icon": "fa fa-pencil-square-o",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["PAYBILL_MAKER", "PAYBILL_CHECKER", "PAYBILL_AUDITOR", "ADMINISTRATOR"])
			}, {
				"name":"Closed Changes",
				"url":"/closed-adjustments",
				"icon":"fa fa-pencil-square-o",
				"ic_color":darkBlue,
				"visible": $scope.linkVisible(["PAYBILL_MAKER", "PAYBILL_CHECKER", "PAYBILL_AUDITOR", "ADMINISTRATOR"])
			},{
				"name": "Payment Reports",
				"url": "/payment-reports",
				"icon": "fa fa-file",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["PAYBILL_MAKER", "PAYBILL_CHECKER", "PAYBILL_AUDITOR", "ADMINISTRATOR"])
			}
			// {"name":"Reports","url":"/reports","icon":"fa fa-file","ic_color":"brown"}
		];
	});


	$scope.logout = function() {
		TokenStorage.clear();
		$location.path('/login');
	};

	$scope.changePassword = function() {
		var token = TokenStorage.retrieve();
		var user = token.split('.')[0];
		$location.path('/password-change/' + user);
	};

	$scope.navigateTo = function(path) {
		$location.path(path);
	};

};

module.exports = MainController;