/**
 * Created by munenedk-pc on 12-Jul-16.
 */

var AccountClosure = function ($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage,
        $location, $routeParams, LoginService, AccountClosureService, AlertUtils, $filter) {
    //Inject Service Methods in scope
    $scope.getUserMenu = LoginService.loadMenu();


    $scope.updateBusinessNumber = AccountClosureService.updateBizNumber();
    $scope.rejectRequest = AccountClosureService.rejectRequest();

    $scope.isSessionActive = TokenStorage.isSessionActive();
    $scope.showToast = AlertUtils.showToast();
    $scope.showAlert = AlertUtils.showAlert();
    $scope.handleError = AlertUtils.handleError();

    //---------------------------Dan Additions. the rest is copy pasted------------------------------
    //Account Closure Data and config variables
    $scope.account = {};
    $scope.account.closeType = "";
    $scope.buttonText = "Search";
    $scope.selectAll = false;
    $scope.getClosureDetails = AccountClosureService.listClosureDetails();
    $scope.saveAccount = AccountClosureService.save();
    $scope.approveClosures = AccountClosureService.sendClosureList();
    $scope.searchMobileNo = AccountClosureService.getMisdn();
    $scope.accountsForAuth = [];
    $scope.data = [];
    $scope.searchData = {};
    $scope.searchStuff = [];
    $scope.showList = true;
    $scope.showUploadProgress = false;
    $scope.disableActions = true;
    $scope.fieData = [];

    //Recycle request table code here
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
        $scope.isPaybillMaker = auths.indexOf('ROLE_PAYBILL_MAKER') > -1;
        $scope.isPaybillChecker = auths.indexOf('ROLE_PAYBILL_CHECKER') > -1;

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

    $scope.selectIndividual = function (row) {
        //Insert row if it does not exist
        if ($scope.accountsForAuth.indexOf(row) === -1) {
            $scope.accountsForAuth.push(row);
            $scope.disableActions = false;
        } else {
            //Remove it if it exists
            var index = $scope.accountsForAuth.indexOf(row);
            $scope.accountsForAuth.splice(index, 1);
            //Disable buttons if array has nothing
            if ($scope.accountsForAuth.length === 0) {
                $scope.disableActions = true;
            }
        }
        console.log($scope.accountsForAuth);
    };

    $scope.selectAllAccounts = function (rows) {
        //If array is empty it knows you want to select all
        if ($scope.accountsForAuth.length === 0) {
            for (var row in rows) {
                //Insert rows if they dont exist
                if ($scope.accountsForAuth.indexOf(rows[row]) === -1) {
                    $scope.accountsForAuth.push(rows[row]);
                    $scope.disableActions = false;
                }
            }
        } else {
            //Otherwise it knows you want to remove everything
            $scope.accountsForAuth = [];
            $scope.disableActions = true;
        }
        console.log($scope.accountsForAuth);
    };

    $scope.uploadFile = function () {
        $scope.showUploadProgress = true;
        var f = document.getElementById('bulkUpload').files[0],
                r = new FileReader();
        r.onloadend = function (e) {
            $scope.fieData = (e.target.result).split("\n");
            //send file data here
            console.log($scope.fieData);
        };
        r.readAsBinaryString(f);
        $scope.showUploadProgress = false;
    };

    $scope.searchOrSubmit = function (account, buttonText) {
        var number = account.recMisdn;
        var prefix = $filter('limitTo')(number, 4, 0);
        console.log(prefix);
        if (prefix !== "2547") {
            $scope.showToast("Please enter a 12 digit number beginning with 2547");
        } else {
            if (angular.equals(buttonText, "Search")) {
                $scope.searchMobileNo(number)
                        .success(function (data, status, headers, config) {
                            $scope.showList = false;
                            $scope.searchStuff = [];
                            $scope.searchData = data.payload;
                            $scope.searchStuff.push($scope.searchData);
                            $scope.showToast(data.message);
                        })
                        .error(function (data, status, headers, config) {
                            $scope.handleError(data, status, headers, config);
                        });
            } else {
                //Submit account
                if ($scope.form.closureForm.$valid) {
                    console.log(account);
                    $scope.saveAccount(account)
                            .success(function (data, status, headers, config) {
                                $scope.showToast(data.message);
                                $scope.resetForm();
                                //Refresh table
                                //$scope.refreshTable();
                                $scope.tableParams.reload();
                            })
                            .error(function (data, status, headers, config) {
                                // console.log("Result: "+ data+"status: "+status);
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
            $scope.approveClosures($scope.accountsForAuth)
                    .success(function (data, status, headers, config) {
                        $scope.showToast(data.message);
                        $scope.tableParams.reload();
                    })
                    .error(function (data, status, headers, config) {
                        $scope.handleError(data, status, headers, config);
                    });
        }, function () {
            // $scope.status = 'You decided to keep your debt.';
        });
    };

    //------------------------------------------- End of Dan Additions---------------------------------

    //Show Menu Buttons
    $rootScope.hamburgerAvailable = true;
    $rootScope.menuAvailable = false;

    //Save Business Number
    $scope.save = function (biz) {
        console.log($scope.form);
        if ($scope.form.bizNoForm.$valid) {
            $scope.saveBiz(biz)
                    .success(function (data, status, headers, config) {
                        $scope.showToast(data.message);
                        $scope.resetForm();
                    })
                    .error(function (data, status, headers, config) {
                        // console.log("Result: "+ data+"status: "+status);
                        $scope.handleError(data, status, headers, config);
                    });
        }
    };

    //Update Business Number
    $scope.update = function (biz) {
        if ($scope.form.bizNoForm.$valid) {
            $scope.updateBusinessNumber(biz)
                    .success(function (data, status, headers, config) {
                        $scope.biz = data.payload;
                        $scope.showToast(data.message);
                    })
                    .error(function (data, status, headers, config) {
                        $scope.handleError(data, status, headers, config);
                    });
        }
    };

    $scope.resetForm = function () {
        $scope.account = {};
    };

    //Reject biz
    $scope.rejectBiz = function (ev, biz) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
                .title('Reject Company')
                .content('Are you sure you want to reject this company?')
                .ariaLabel('approve')
                .ok('Yes')
                .cancel('Cancel')
                .targetEvent(ev);
        $mdDialog.show(confirm).then(function () {
            $scope.rejectRequest(biz)
                    .success(function (data, status, headers, config) {
                        $scope.showToast(data.message);
                        $scope.tableParams.reload();
                    })
                    .error(function (data, status, headers, config) {
                        $scope.handleError(data, status, headers, config);
                    });
        }, function () {
            // $scope.status = 'You decided to keep your debt.';
        });
    };


};

module.exports = AccountClosure;
