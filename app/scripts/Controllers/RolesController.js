/*jslint node: true */
/* global angular: false */

var RolesController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, RolesService, PermissionsService, TokenStorage, $location, LoginService, AlertUtils) {
	//Inject Services To Scope
	$scope.getUserMenu = LoginService.loadMenu();
	$scope.getRoles = RolesService.list();
	$scope.getRole = RolesService.find();
	$scope.saveRole = RolesService.save();
	$scope.getPermissions = PermissionsService.list();
	$scope.isSessionActive = TokenStorage.isSessionActive();
	$scope.showToast = AlertUtils.showToast();
	$scope.showAlert = AlertUtils.showAlert();
	$scope.handleError = AlertUtils.handleError();

	//check authentication
	var token = TokenStorage.retrieve();
	$rootScope.authenticated = false;

	//Tabs
	$scope.roleDetailsTabDisabled = false;
	$scope.permissionTabDisabled = true;
	$scope.selectedTab = 0;

	//Selected Permissions
	$scope.selectedPermissions = [];

	if ($scope.isSessionActive(token) === true) {
		var user = JSON.parse(atob(token.split('.')[0]));
		$rootScope.authenticated = true;
		$rootScope.loggedInUser = user.usrName;
		$scope.getUserMenu();

		//Roles Table
		$scope.tableParams = new ngTableParams({
			page: 1, //Show first page
			count: 10, //count per page
		}, {
			total: 0,
			getData: function($defer, params) {
				//ajax request to api
				$scope.getRoles(params)
					.success(function(data, status, headers, config) {
						var rData = {};
						rData = data.payload;
						// console.log(JSON.stringify(rData));

						var roles = rData.content;

						params.total(rData.totalElements);
						//set New data
						$defer.resolve(roles);
					})
					.error(function(data, status, headers, config) {
						var msg = "N/A";
						if (data !== null) {
							msg = data.error + " : " + data.message;
						}
						$scope.showAlert(status, msg);
					});
			}
		});

		//Permissions Table
		$scope.permissionTableParams = new ngTableParams({
			page: 1, //Show first page
			count: 10, //count per page
		}, {
			total: 0,
			getData: function($defer, params) {
				//ajax request to api
				$scope.getPermissions(params)
					.success(function(data, status, headers, config) {
						var rData = {};
						rData = data.payload;
						// console.log(JSON.stringify(rData));

						var permissions = rData.content;

						params.total(rData.totalElements);
						//set New data
						$defer.resolve(permissions);
					})
					.error(function(data, status, headers, config) {
						var msg = "N/A";
						if (data !== null) {
							msg = data.error + " : " + data.message;
						}
						$scope.showAlert(status, msg);
					});
			}
		});
	} else {
		TokenStorage.clear();
		$scope.showToast("Your Session has exprired. You have been redirected to the login page.");
		$location.path('/login');
	}

	//Menu
	$rootScope.hamburgerAvailable = true;
	$rootScope.menuAvailable = true;

	//Role Form
	$scope.form = {};

	$scope.setRole = function(role) {
		if ($scope.form.roleForm.$valid) {
			$scope.role = role;
			// console.log(JSON.stringify($scope.role));
			$scope.permissionTabDisabled = false;
			$scope.roleDetailsTabDisabled = true;
			$scope.selectedTab = 1;
		}
	};

	//Reset role Form
	$scope.resetForm = function() {
		$scope.role = {};
	};

	$scope.save = function() {
		var rolesContext = {
			'role': $scope.role,
			'permissions': $scope.selectedPermissions
		};

		$scope.saveRole(rolesContext)
			.success(function(data, status, headers, config) {
				$scope.showToast(data.message);
				$scope.resetForm();
			}).error(function(data, status, headers, config) {
				$scope.showAlert(status, data.message);
			});
	};

	$scope.toggleSelectedPermission = function(permission) {
		var idx = $scope.selectedPermissions.indexOf(permission);

		//is Currently selected
		if (idx > -1) {
			$scope.selectedPermissions.splice(idx, 1);
		}

		//is newly selected
		else {
			$scope.selectedPermissions.push(permission);
		}
	};

	$scope.restart = function() {
		$scope.resetForm();
		$scope.selectedPermissions.length = 0;
		$scope.permissionTabDisabled = true;
		$scope.roleDetailsTabDisabled = false;
		$scope.selectedTab = 0;
	};
};

module.exports = RolesController;