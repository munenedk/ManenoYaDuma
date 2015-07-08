/*jslint node: true */
/* global angular: false */

var CustomerController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, CustomerService, $routeParams, TokenStorage, $location, LoginService) {
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

  //Inject Service methods to scope
  $scope.getCustomers = CustomerService.list();
  $scope.getCustomer = CustomerService.find();

  //Toast Position
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

  //Error messages
  var redirectMsg = ". Your session has expired. You will now be redirected";
  var forbiddenMsg = ". You do not have permission to use this resource";

  //Error Handling
  $scope.handleError = function(data, status, headers, config) {
    var msg = data === null ? "Message Unavailable" : data.message;
    if (status === 401) { //unauthorized
      $scope.showAlert(status, msg + redirectMsg);
      location.path('/login');
    } else if (status === 403) { //forbidden
      $scope.showAlert(status, msg + forbiddenMsg);
    } else {
      $scope.showAlert(status, msg);
    }
  };

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