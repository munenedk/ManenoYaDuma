/*jslint node: true */
/* global angular: false */

var RolesController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, RolesService, PermissionsService, TokenStorage, $location,LoginService) {
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

	//Menu
	$rootScope.hamburgerAvailable = true;
	$rootScope.menuAvailable = true;

	//Tabs
	$scope.roleDetailsTabDisabled = false;
	$scope.permissionTabDisabled = true;
	$scope.selectedTab = 0;

	//Role Form
	$scope.form = {};

	//Selected Permissions
	$scope.selectedPermissions = [];

	//Inject Services To Scope
	$scope.getRoles = RolesService.list();
	$scope.getRole = RolesService.find();
	$scope.saveRole = RolesService.save();
	$scope.getPermissions = PermissionsService.list();


	//Toast Position
	$scope.toastPosition = {
		bottom: false,
		top: true,
		left: false,
		right: true
	};

	//Get Toast
	$scope.getToastPosition = function() {
		return Object.keys($scope.toastPosition).filter(function(pos) {
			return $scope.toastPosition[pos];
		}).join(' ');
	};

	//Show Toast
	$scope.showToast = function(message) {
		$mdToast.show(
			$mdToast.simple()
			.content(message)
			.position($scope.getToastPosition())
			.hideDelay(5000));
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