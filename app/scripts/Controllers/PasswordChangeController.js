/*jslint node: true */
/* global angular: false */
var PasswordChangeController = function($scope, $rootScope, $mdDialog, $mdToast, dumaSettings, PasswordChangeService, TokenStorage, $location, $routeParams) {
  //check authentication
  if ($routeParams.user) {
    var token = TokenStorage.retrieve();
    $rootScope.authenticated = false;
    if (token) {
      token = JSON.parse(atob(token.split('.')[0]));
      $rootScope.authenticated = true;
      $rootScope.loggedInUser = token.usrName;
    } else {
      $location.path('/login');
    }
  }


  //Show Menu Buttons
  $rootScope.hamburgerAvailable = false;
  $rootScope.menuAvailable = false;

  //Inject service methods to scope
  $scope.submitPassword = PasswordChangeService.changePassword();
  $scope.passwordReset = PasswordChangeService.resetPassword();

  //Error Messages
  var redirectMsg = ". Your session has expired. You will now be redirected";
  var forbiddenMsg = ". You do not have permission to use this resource";

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

  //Error Handling
  $scope.handleError = function(data, status, headers, config) {
    var msg = data === null ? "Message Unavailable" : data.message;
    if (status === 401) { //unauthorized
      $scope.showAlert(status, msg + redirectMsg);
      location.path('/home');
    } else if (status === 403) { //forbidden
      $scope.showAlert(status, msg + forbiddenMsg);
    } else {
      $scope.showAlert(status, msg);
    }
  };

  //init user
  if ($routeParams.user) {
    $scope.user = JSON.parse(atob($routeParams.user));
    $scope.user.usrPassword = "12345";
  }


  //Save password
  $scope.changePassword = function(user) {
    if ($scope.passwordChangeForm.$valid) {
      if (user.newPassword === user.confirmPassword) {
        $scope.submitPassword(user)
          .success(function(data, status, headers, config) {
            $scope.showToast(data.message + " Redirecting...");
            $location.path('/home');
          })
          .error(function(data, status, headers, config) {
            $scope.handleError(data, status, headers, config);
          });
      } else {
        $scope.showAlert('100', "Password Mismatch");
      }
    }
  };

  //Reset Password
  $scope.resetPassword = function(email) {
    $scope.passwordReset(email)
      .success(function(data, status, headers, config) {
        $scope.showToast(data.message + " Redirecting...");
        $location.path('/login');
      })
      .error(function(data, status, headers, config) {
        $scope.handleError(data, status, headers, config);
      });
  };

};

module.exports = PasswordChangeController;