/*jslint node: true */
/* global angular: false */

var LoginController = function($scope,$rootScope,$mdDialog,$mdToast,LoginService,TokenStorage,$location,$mdSidenav){
	$rootScope.hamburgerAvailable = false;
	$rootScope.menuAvailable=false;

	$rootScope.authenticated = false;
	$scope.token =""; //For Display Purposes only

		//Inject Service Methods
		$scope.userLogin = LoginService.login();

	//Toast Position
	$scope.toastPosition = {
		bottom:false,
		top:true,
		left:false,
		right:true
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
	$scope.showToast = function(message){
		$mdToast.show(
			$mdToast.simple()
			.content(message)
			.position($scope.getToastPosition())
			.hideDelay(5000)
			);
	};

	//Alerts
	$scope.alert = "";
	$scope.showAlert = function(status,message){
		$mdDialog.show(
			$mdDialog.alert()
			.title("Error "+status)
			.content(message)
			.ariaLabel('Error Notification')
			.ok('Ok')
			);
	};

	$scope.login = function(user){
		if($scope.loginForm.$valid){
			$scope.userLogin(user)
			.success(function(data,status,headers,config){
				$scope.showToast("Login Successful. Redirecting...");
				$rootScope.authenticated = true;
				TokenStorage.store(headers('X-AUTH-TOKEN'));

			// Display
			$scope.token = JSON.parse(atob(TokenStorage.retrieve().split('.')[0]));
			$rootScope.loggedInUser = $scope.token.usrName;
			$location.path('/customers');
		}).error(function(result, status, headers){
			console.log(result);
			var msg = result.error+"\n"+result.message;
			$scope.showAlert(status,msg);
		});
	}
};

};

module.exports = LoginController;