/*jslint node: true */
/* global angular: false */

var LoginController = function($scope, $rootScope, $mdDialog, $mdToast, LoginService, TokenStorage, $location, $mdSidenav, AlertUtils) {
  //Inject Service Methods
  $scope.userLogin = LoginService.login();
  $scope.getUserMenu = LoginService.loadMenu();
  $scope.showToast = AlertUtils.showToast();
  $scope.showAlert = AlertUtils.showAlert();

  $rootScope.hamburgerAvailable = false;
  $rootScope.menuAvailable = false;

  $rootScope.authenticated = false;
  $scope.token = ""; //For Display Purposes only

  //Initialize Domain Selector
  $scope.user = {
    // "useDumaDomain": false
    "useDumaDomain": true
  };

  //Error Handling
  $scope.handleError = function(result, status, headers) {
    // var msg = result === null ? "Server Unreachable" : result;
    var msg = result === null ? "Server Unreachable" : "Invalid Username Or Password.";
    $scope.showAlert(status, msg);
  };

  $scope.login = function(user) {
    if ($scope.loginForm.$valid) {
      $scope.userLogin(user)
        .success(function(data, status, headers, config) {
          //Store Token
          TokenStorage.store(headers('X-AUTH-TOKEN'));

          var tkn = TokenStorage.retrieve();
          if (tkn !== 'null') {
            // $scope.token = JSON.parse(atob(TokenStorage.retrieve().split('.')[0]));
            var part1 = JSON.parse(atob(tkn.split('.')[0]));
            // var part2 = JSON.parse(atob(tkn.split('.')[1]));
            // console.log(part1);
            // console.log(JSON.stringify(part2));
            // $scope.token = JSON.parse(atob(tkn.split('.')[0]));
            $scope.token = part1;
            $rootScope.loggedInUser = $scope.token.usrName;
            $rootScope.authenticated = true;
            $scope.showToast("Login Successful. Redirecting...");
            if ($scope.token.usrStatus === 0 && user.useDumaDomain === true) { //New user Redirect to password change
              $location.path('/password-change/' + btoa(JSON.stringify(user)));
            } else {
              $location.path('/home');
            }
          } else {
            $scope.showAlert("403", "You are not configured to use this portal. Contact your system administrator");
          }
        }).error(function(result, status, headers) {
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