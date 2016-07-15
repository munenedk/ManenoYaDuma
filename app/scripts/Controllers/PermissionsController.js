/*jslint node: true */
/* global angular: false */

var PermissionsController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, PermissionsService, TokenStorage, $location, LoginService, AlertUtils) {

	//Inject Services To Scope
	$scope.getUserMenu = LoginService.loadMenu();
	$scope.getPermissions = PermissionsService.list();
	$scope.getPermission = PermissionsService.find();
	$scope.savePermission = PermissionsService.save();
	$scope.isSessionActive = TokenStorage.isSessionActive();
	$scope.showToast = AlertUtils.showToast();
	$scope.showAlert = AlertUtils.showAlert();
	$scope.handleError = AlertUtils.handleError();

	//Get Authentication Token
	var token = TokenStorage.retrieve();
	$rootScope.authenticated = false;

	//Permissions Checkboxes
	$scope.permissionsChckBox = {};

	if ($scope.isSessionActive(token) === true) {
		var user = JSON.parse(atob(token.split('.')[0]));
		$rootScope.authenticated = true;
		$rootScope.loggedInUser = user.usrName;
		$scope.getUserMenu();

		//Table
		$scope.tableParams = new ngTableParams({
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
	$rootScope.menuAvailable = false;

	//Save Role
	$scope.save = function save(permission) {
		if ($scope.permissionForm.$valid) {
			$scope.savePermission(permission)
				.success(function(data, status, headers, config) {
					$scope.showToast(data.message);
					$scope.resetForm();
				}).error(function(data, status, headers, config) {
					$scope.showAlert(status, data.message);
				});
		}
	};

	//Reset Permissions Form
	$scope.resetForm = function() {
		$scope.permission = {
			permissionId: '',
			permissionName: '',
			permissionDescription: '',
		};
	};
};

module.exports = PermissionsController;