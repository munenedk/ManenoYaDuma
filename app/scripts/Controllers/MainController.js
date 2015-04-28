/*jslint node: true */
/* global angular: false */

var MainController = function($scope,$mdSidenav){

	$scope.toggleSideNav = function(menuId){
		$mdSidenav(menuId).toggle();
	};

	$scope.menuItems = [
	{"name":"Customers","url":"#/customers"},
	{"name":"Reports","url":"#/reports"}];

};

module.exports = MainController;