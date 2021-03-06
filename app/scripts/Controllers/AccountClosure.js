/**
 * Created by munenedk-pc on 12-Jul-16.
 */

var AccountClosure = function ($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage,
        $location, $routeParams, LoginService, AccountClosureService, AlertUtils, $filter, $route) {

    //Inject Service Methods in scope
    $scope.getUserMenu = LoginService.loadMenu();
    $scope.isSessionActive = TokenStorage.isSessionActive();
    $scope.showToast = AlertUtils.showToast();
    $scope.showAlert = AlertUtils.showAlert();
    $scope.handleError = AlertUtils.handleError();

    //Account Closure Data and config variables
    $scope.account = {};
    $scope.account.recStatusDesc = "";
    $scope.buttonText = "Search";
    $scope.select = {};
    $scope.select.all = false;
    $scope.select.individual = [];
    $scope.getClosureDetails = AccountClosureService.listClosureDetails();
    $scope.saveAccount = AccountClosureService.save();
    $scope.approveClosures = AccountClosureService.sendClosureList();
    $scope.rejectClosures = AccountClosureService.sendRejectionList();
    $scope.uploadBulkClosures = AccountClosureService.sendBulkList();
    $scope.searchMobileNo = AccountClosureService.getMisdn();
    $scope.accountsForAuth = [];
    $scope.data = [];
    $scope.searchStuff = [];
    $scope.showList = true;
    $scope.showMaterialProgress = false;
    $scope.disableActions = true;
    $scope.fileData = [];

    //Get user token
    var token = TokenStorage.retrieve();

    $scope.refreshTable = function () {
        $scope.showList = true;
        $scope.getClosureDetails = AccountClosureService.listClosureDetails();
    };

    //Check if there's an active session
    if ($scope.isSessionActive(token) === true) {
        var user = JSON.parse(atob(token.split('.')[0]));
        $rootScope.authenticated = true;
        $rootScope.loggedInUser = user.usrName;
        $scope.getUserMenu();

        //Check if is Closure Maker or checker
        var authorities = user.authorities;
        var auths = [];
        for (var i in authorities) {
            // console.log(authorities[i].authority);
            auths.push(authorities[i].authority);
        }

        //Evaluate Roles
        $scope.isClosureMaker = auths.indexOf('ROLE_ACCOUNT_CLOSURE_MAKER') > -1;
        $scope.isClosureChecker = auths.indexOf('ROLE_ACCOUNT_CLOSURE_CHECKER') > -1;

        //Account Closure Table
        $scope.showList = true;
        $scope.tableParams = new ngTableParams({
            page: 1, //Show First page
            count: 10 //count per page
        }, {
            total: 0, //length of data
            getData: function ($defer, params) {
                //Ajax Request to API
                $scope.getClosureDetails(params)
                        .success(function (data, status, headers, config) {
                            var rData = data.payload;
                            $scope.data = rData.content;
                            params.total(rData.totalElements);
                            //set New Data
                            $defer.resolve($scope.data);
                        })
                        .error(function (data, status, headers, config) {
                            $scope.handleError(data, status, headers, config);
                        });
            }
        });

    } else {
        TokenStorage.clear();
        $scope.showToast("Your Session has exprired. You have been redirected to the login page.");
        $location.path('/login');
    }

    $scope.closureTypeChanged = function (model) {
        if (angular.equals(model, "")) {
            $scope.buttonText = "Search";
        } else {
            $scope.buttonText = "Submit";
        }
    };

    $scope.selectIndividual = function (row, id) {
        //Insert row if it does not exist
        if ($scope.accountsForAuth.indexOf(row) === -1 && $scope.select.individual[id] === true) {
            //Add only pending approvals
            if (row.recStatus === '5') {
                $scope.accountsForAuth.push(row);
                //Check if checker
                if ($scope.isClosureChecker) {
                    $scope.disableActions = false;
                }
            }
        } else if ($scope.accountsForAuth.indexOf(row) > -1 && $scope.select.individual[id] === false) {
            //Remove it if it exists
            var index = $scope.accountsForAuth.indexOf(row);
            $scope.accountsForAuth.splice(index, 1);
            //Disable buttons if array has nothing
            if ($scope.accountsForAuth.length === 0) {
                $scope.disableActions = true;
            }
        }
    };

    $scope.selectAllAccounts = function (rows) {
        //If array is empty it knows you want to select all
        if ($scope.accountsForAuth.length === 0 || $scope.select.all) {
            for (var row in rows) {
                //Insert rows if they dont exist
                if ($scope.accountsForAuth.indexOf(rows[row]) === -1) {
                    //Add only pending approvals
                    if (rows[row].recStatus === '5') {
                        //Mark row as selected
                        $scope.select.individual[row] = true;
                        $scope.accountsForAuth.push(rows[row]);
                        //Check if checker
                        if ($scope.isClosureChecker) {
                            $scope.disableActions = false;
                        }
                    }
                }
            }
        } else if ($scope.accountsForAuth.length > 0 && $scope.select.all === false) {
            //Otherwise it knows you want to remove everything
            for (var i in rows) {
                $scope.select.individual[i] = false;
            }
            $scope.accountsForAuth = [];
            $scope.disableActions = true;

        }
    };

    $scope.uploadFile = function () {
        $scope.showMaterialProgress = true;
        var f = document.getElementById('bulkUpload').files[0],
                r = new FileReader();
        r.onloadend = function (e) {
            //Convert contents into an array of arrays
            var fileString = (e.target.result).split("\n");
            //Loop through main array to access child arrays
            for (var i in fileString) {
                //Convert all child arrays to objects
                var item = fileString[i].split(",");
                var rec = {};
                rec.recMisdn = item[0];
                rec.recTypeDesc = item[1];
                $scope.fileData.push(rec);
            }

            //send array of objects
            $scope.uploadBulkClosures($scope.fileData)
                    .success(function (data, status, headers, config) {
                        $scope.showMaterialProgress = false;
                        $scope.showToast(data.message);
                        $route.reload();
                    })
                    .error(function (data, status, headers, config) {
                        $scope.showMaterialProgress = false;
                        $scope.handleError(data, status, headers, config);
                    });
        };
        r.readAsBinaryString(f);
    };

    $scope.searchOrSubmit = function (account, buttonText) {
        var number = account.recMisdn;
        var prefix = $filter('limitTo')(number, 4, 0);
        if (prefix !== "2547") {
            $scope.showToast("Please enter a 12 digit number beginning with 2547");
        } else {
            if (angular.equals(buttonText, "Search")) {
                $scope.searchMobileNo(number)
                        .success(function (data, status, headers, config) {
                            $scope.showList = false;
                            $scope.searchStuff = [];
                            $scope.searchStuff.push(data.payload);
                            $scope.showToast(data.message);
                        })
                        .error(function (data, status, headers, config) {
                            $scope.handleError(data, status, headers, config);
                        });
            } else {
                //Submit account
                if ($scope.form.closureForm.$valid) {
                    $scope.saveAccount(account)
                            .success(function (data, status, headers, config) {
                                $scope.showToast(data.message);
                                $scope.resetForm();
                                //Refresh table
                                $scope.tableParams.reload();
                            })
                            .error(function (data, status, headers, config) {
                                $scope.handleError(data, status, headers, config);
                            });
                }
            }
        }
    };

    //Approve Closures
    $scope.approveAccounts = function (ev) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
                .title('Approve Closure')
                .content('Are you sure you want to approve the selected closures?')
                .ariaLabel('approve')
                .ok('Yes')
                .cancel('Cancel')
                .targetEvent(ev);
        $mdDialog.show(confirm).then(function () {
            $scope.showMaterialProgress = true;
            $scope.approveClosures($scope.accountsForAuth)
                    .success(function (data, status, headers, config) {
                        $scope.accountsForAuth = [];
                        for (var i in $scope.select.individual) {
                            $scope.select.individual[i] = false;
                        }
                        $route.reload();
                        $scope.showToast(data.message);
                        $scope.showMaterialProgress = false;
                    })
                    .error(function (data, status, headers, config) {
                        $scope.accountsForAuth = [];
                        for (var i in $scope.select.individual) {
                            $scope.select.individual[i] = false;
                        }
                        $scope.showMaterialProgress = false;
                        $scope.handleError(data, status, headers, config);
                    });
        }, function () {
            // Do nothing basically
        });
    };

    //Reject Closures
    $scope.rejectAccounts = function (ev) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
                .title('Reject Closure')
                .content('Are you sure you want to reject the selected closures?')
                .ariaLabel('reject')
                .ok('Yes')
                .cancel('Cancel')
                .targetEvent(ev);
        $mdDialog.show(confirm).then(function () {
            $scope.showMaterialProgress = true;
            $scope.rejectClosures($scope.accountsForAuth)
                    .success(function (data, status, headers, config) {
                        $scope.accountsForAuth = [];
                        for (var i in $scope.select.individual) {
                            $scope.select.individual[i] = false;
                        }
                        $route.reload();
                        $scope.showToast(data.message);
                        $scope.showMaterialProgress = false;
                    })
                    .error(function (data, status, headers, config) {
                        $scope.accountsForAuth = [];
                        for (var i in $scope.select.individual) {
                            $scope.select.individual[i] = false;
                        }
                        $scope.showMaterialProgress = false;
                        $scope.handleError(data, status, headers, config);
                    });
        }, function () {
            // Do nothing basically
        });
    };

    //Show Menu Buttons
    $rootScope.hamburgerAvailable = true;
    $rootScope.menuAvailable = false;

    $scope.resetForm = function () {
        $scope.account = {};
    };




};

module.exports = AccountClosure;
