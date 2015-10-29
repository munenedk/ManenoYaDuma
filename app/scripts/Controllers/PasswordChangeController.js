/*jslint node: true */
/* global angular: false */
var PasswordChangeController = function($scope, $rootScope, $mdDialog, $mdToast, dumaSettings, PasswordChangeService, TokenStorage, $location, $routeParams, AlertUtils) {
  //Inject service methods to scope
  $scope.submitPassword = PasswordChangeService.changePassword();
  $scope.passwordReset = PasswordChangeService.resetPassword();
  $scope.isSessionActive = TokenStorage.isSessionActive();
  $scope.showToast = AlertUtils.showToast();
  $scope.showAlert = AlertUtils.showAlert();
  $scope.handleError = AlertUtils.handleError();

  //check authentication
  if ($routeParams.user) {
    var token = TokenStorage.retrieve();
    $rootScope.authenticated = false;
    if ($scope.isSessionActive(token) === true) {
      var usr = JSON.parse(atob(token.split('.')[0]));
      $rootScope.authenticated = true;
      $rootScope.loggedInUser = usr.usrName;

      //init user
      if ($routeParams.user) {
        $scope.user = JSON.parse(atob($routeParams.user));
        $scope.user.usrPassword = "12345";
      }
    } else {
      TokenStorage.clear();
      $scope.showToast("Your Session has exprired. You have been redirected to the login page.");
      $location.path('/login');
    }
  }

  //Show Menu Buttons
  $rootScope.hamburgerAvailable = false;
  $rootScope.menuAvailable = false;

  //Error Messages
  var redirectMsg = ". Your session has expired. You will now be redirected";
  var forbiddenMsg = ". You do not have permission to use this resource";

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