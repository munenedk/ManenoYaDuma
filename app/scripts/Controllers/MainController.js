/*jslint node: true */
/* global angular: false */

var MainController = function($scope,$rootScope,$location,$mdSidenav){

	$scope.toggleSideNav = function(menuId){
		// $mdSidenav(menuId).toggle();
		if($rootScope.menuAvailable === false){
			$rootScope.menuAvailable = true;
		}else{
			$rootScope.menuAvailable = false;
		}
		
	};

	$scope.menuItems = [
	{"name":"Customers","url":"/customers","icon":"fa fa-users","ic_color":"green"},
	{"name":"Users","url":"/users","icon":"fa fa-user","ic_color":"blue"},
	{"name":"Roles","url":"/roles","icon":"fa fa-cog","ic_color":"blue"},
	{"name":"Permissions","url":"/permissions","icon":"fa fa-cogs","ic_color":"blue"},
	{"name":"Mpesa Reconciliation","url":"/mpesaRecon","icon":"fa fa-refresh","ic_color":"blue"}
	// {"name":"Reports","url":"/reports","icon":"fa fa-file","ic_color":"brown"}
  ];

  $scope.navigateTo = function(path){
		// console.log(path);
		$location.path(path);
	};

};

module.exports = MainController;