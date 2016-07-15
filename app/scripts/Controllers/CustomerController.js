/*jslint node: true */
/* global angular: false */

var CustomerController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, CustomerService, $routeParams, TokenStorage, $location, LoginService, AlertUtils) {
  //Inject Service methods to scope
  $scope.getUserMenu = LoginService.loadMenu();
  $scope.getCustomers = CustomerService.list();
  $scope.getCustomer = CustomerService.find();
  $scope.isSessionActive = TokenStorage.isSessionActive();
  $scope.showToast = AlertUtils.showToast();
  $scope.showAlert = AlertUtils.showAlert();
  $scope.handleError = AlertUtils.handleError();

  //Get User Token
  var token = TokenStorage.retrieve();

  $rootScope.authenticated = false;

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
        $scope.getCustomers(params)
          .success(function(data, status, headers, config) {
            var rData = {};
            rData = data.payload;
            // console.log(JSON.stringify(rData));

            var customers = rData.content;
            // console.log(customers);

            params.total(rData.totalElements);
            //set New data
            $defer.resolve(customers);
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

  //Menu
  $rootScope.hamburgerAvailable = true;
  $rootScope.menuAvailable = false;

  $scope.selectedCustomer = function() {
    var customerId = $routeParams.customerId;
    // console.log("Customer ID: "+customerId);
    $scope.getCustomer(customerId)
      .success(function(data, status, headers, config) {
        $scope.showToast(data.message);
        $scope.customer = data.payload;
      }).error(function(data, status, headers, config) {
        $scope.handleError(data, status, headers, config);
      });
  };

};



module.exports = CustomerController;