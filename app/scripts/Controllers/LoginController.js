/*jslint node: true */
/* global angular: false */

var LoginController = function($scope, $rootScope, $mdDialog, $mdToast, LoginService, TokenStorage, $location, $mdSidenav) {
  $rootScope.hamburgerAvailable = false;
  $rootScope.menuAvailable = false;

  $rootScope.authenticated = false;
  $scope.token = ""; //For Display Purposes only

  //Inject Service Methods
  $scope.userLogin = LoginService.login();
  $scope.getUserMenu = LoginService.loadMenu();

//Initialize Domain Selector
  $scope.user = {
    "useDumaDomain":false
  };

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
    );
  };

  //Error messages
  var redirectMsg = ". Your session has expired. You will now be redirected";
  var forbiddenMsg = ". You do not have permission to use this resource";

  //Error Handling
  $scope.handleError = function(result, status, headers) {
    // var msg = result === null ? "Server Unreachable" : result;
    var msg = result === null ? "Server Unreachable" : "Invalid Username Or Password.";
    $scope.showAlert(status, msg);
  };

  $scope.login = function(user) {
    if ($scope.loginForm.$valid) {
      // if (user.useDumaDomain === null || user.useDumaDomain === 'undefined') {
      //   user.useDumaDomain = false;
      // }
      console.log("Use Duma Domain: " + user.useDumaDomain);
      $scope.userLogin(user)
        .success(function(data, status, headers, config) {
          $scope.showToast("Login Successful. Redirecting...");
          $rootScope.authenticated = true;
          TokenStorage.store(headers('X-AUTH-TOKEN'));
          // Display
          $scope.token = JSON.parse(atob(TokenStorage.retrieve().split('.')[0]));
          $rootScope.loggedInUser = $scope.token.usrName;
          //Load user Menu
          if ($scope.token.usrStatus === 0 && user.useDumaDomain === true) { //New user Redirect to password change
            $location.path('/password-change/' + btoa(JSON.stringify(user)));
          } else {
            $location.path('/home');
          }
        }).error(function(result, status, headers) {
          console.log("Post Result: " + result);
          $scope.handleError(result, status, headers);
        });
      // .then(function(response) {
      //   console.log(response);
      // })
      // .catch(function(response) {
      //   console.log(response);
      //   console.error('Gists error', response.status, response.data);
      // });
    }
  };

};

module.exports = LoginController;