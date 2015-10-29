/*jslint node: true */
/* global angular: false */

var MainController = function($scope, $rootScope, $location, $mdSidenav, TokenStorage, LoginService) {
	// var kcbGreen = "#8CC63F";
	var darkBlue = "#00456A";
	$scope.selectedElement = "";


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

	//Check whether is active
	$scope.isActive = function(link) {
		if (link === $scope.selectedElement) {
			return true;
		} else {
			return false;
		}
	};

	$scope.$on('changeMenu', function() {

		$scope.menuItems = [{
				"id": "link_dashboard",
				"name": "Dashboard",
				"url": "/home",
				"icon": "fa fa-dashboard",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["ADMINISTRATOR", "USER"]),
				"active": $scope.isActive("link_dashboard")
			}, {
				"id": "link_customers",
				"name": "Customers",
				"url": "/customers",
				"icon": "fa fa-users",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["ADMINISTRATOR"]),
				"active": $scope.isActive("link_customers")
			}, {
				"id": "link_users",
				"name": "Users",
				"url": "/users",
				"icon": "fa fa-user",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["ADMINISTRATOR", "MTS_ADMINISTRATOR"]),
				"active": $scope.isActive("link_users")
			}, {
				"id": "link_roles",
				"name": "Roles",
				"url": "/roles",
				"icon": "fa fa-cog",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["ADMINISTRATOR", "MTS_ADMINISTRATOR"]),
				"active": $scope.isActive("link_roles")
			}, {
				"id": "link_permissions",
				"name": "Permissions",
				"url": "/permissions",
				"icon": "fa fa-cogs",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["ADMINISTRATOR"]),
				"active": $scope.isActive("link_permissions")
			}, {
				"id": "link_mk_c2b_recon",
				"name": "MK C2B Mpesa Recon",
				"url": "/mpesaRecon/c2b",
				"icon": "fa fa-refresh",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["RECON_MAKER", "RECON_CHECKER", "ADMINISTRATOR"]),
				"active": $scope.isActive("link_mk_c2b_recon")
			}, {
				"id": "link_mk_b2c_recon",
				"name": "MK B2C Mpesa Recon",
				"url": '/mpesaRecon/b2c',
				"icon": "fa fa-refresh",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["RECON_MAKER", "RECON_CHECKER", "ADMINISTRATOR"]),
				"active": $scope.isActive("link_mk_b2c_recon")
			}, {
				"id": "link_mts_sales",
				"name": "MTS Sales",
				"url": "/mk-ambassadors",
				"icon": "fa fa-money",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["MK_AMBASSADOR", "MOBI_DSR", "MOBI_STAFF"]),
				"active": $scope.isActive("link_mts_sales")
			}, {
				"id": "link_mts_sales_admin",
				"name": "MTS Sales Admin",
				"url": "/mts-sales-admin",
				"icon": "fa fa-money",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["MTS_ADMINISTRATOR", "MTS_SALES_MANAGER", "ADMINISTRATOR"]),
				"active": $scope.isActive("link_mts_sales_admin")
			}, {
				"id": "link_business_numbers",
				"name": "Business Numbers",
				"url": "/bizNos",
				"icon": "fa fa-list",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["PAYBILL_MAKER", "PAYBILL_CHECKER", "PAYBILL_AUDITOR", "ADMINISTRATOR"]),
				"active": $scope.isActive("link_business_numbers")
			}, {
				"id": "link_billing_companies",
				"name": "Billing Companies",
				"url": "/companies",
				"icon": "fa fa-building",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["PAYBILL_MAKER", "PAYBILL_CHECKER", "PAYBILL_AUDITOR", "ADMINISTRATOR"]),
				"active": $scope.isActive("link_billing_companies")

			}, {
				"id": "link_cards",
				"name": "Cards",
				"url": "/cards",
				"icon": "fa fa-credit-card",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["PAYBILL_MAKER", "PAYBILL_CHECKER", "PAYBILL_AUDITOR", "ADMINISTRATOR"]),
				"active": $scope.isActive("link_cards")
			}, {
				"id": "link_c2b_payments",
				"name": "C2B Payments",
				"url": "/payments",
				"icon": "fa fa-money",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["PAYBILL_MAKER", "PAYBILL_CHECKER", "PAYBILL_AUDITOR", "ADMINISTRATOR"]),
				"active": $scope.isActive("link_c2b_payments")
			}, {
				"id": "link_pending_changes",
				"name": "Pending Changes",
				"url": "/pending-adjustments",
				"icon": "fa fa-pencil-square-o",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["PAYBILL_MAKER", "PAYBILL_CHECKER", "PAYBILL_AUDITOR", "ADMINISTRATOR"]),
				"active": $scope.isActive("link_pending_changes")

			}, {
				"id": "link_closed_changes",
				"name": "Closed Changes",
				"url": "/closed-adjustments",
				"icon": "fa fa-pencil-square-o",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["PAYBILL_MAKER", "PAYBILL_CHECKER", "PAYBILL_AUDITOR", "ADMINISTRATOR"]),
				"active": $scope.isActive("link_closed_changes")
			}, {
				"id": "link_payment_reports",
				"name": "Payment Reports",
				"url": "/payment-reports",
				"icon": "fa fa-file",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["PAYBILL_MAKER", "PAYBILL_CHECKER", "PAYBILL_AUDITOR", "ADMINISTRATOR"]),
				"active": $scope.isActive("link_payment_reports")
			}, {
				"id": "link_mtn_payments",
				"name": "MTN Payments",
				"url": "/mtn-payments",
				"icon": "fa fa-money",
				"ic_color": darkBlue,
				"visible": $scope.linkVisible(["MTN_AUDITOR", "ADMINISTRATOR"]),
				"active": $scope.isActive("link_mtn_payments")

			}
			// {"name":"Reports","url":"/reports","icon":"fa fa-file","ic_color":"brown"}
		];

	});


	$scope.logout = function() {
		$scope.selectedElement = "";
		TokenStorage.clear();
		$location.path('/login');
	};

	$scope.changePassword = function() {
		var token = TokenStorage.retrieve();
		var user = token.split('.')[0];
		$location.path('/password-change/' + user);
	};

	$scope.navigateTo = function(path, selected) {
		$scope.selectedElement = selected;
		$location.path(path);
	};

};

module.exports = MainController;