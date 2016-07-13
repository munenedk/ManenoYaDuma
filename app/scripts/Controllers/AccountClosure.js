/**
 * Created by munenedk-pc on 12-Jul-16.
 */

var AccountClosure = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage, $location, $routeParams, LoginService, AccountClosureService, AlertUtils) {
    //Inject Service Methods in scope
    $scope.getUserMenu = LoginService.loadMenu();

    $scope.getBusinessNumbers = AccountClosureService.listBusinessNumbers();
    $scope.getBusinessNumber = AccountClosureService.getBizNumber();
    $scope.updateBusinessNumber = AccountClosureService.updateBizNumber();
    $scope.saveBiz = AccountClosureService.save();
    $scope.approveRequest = AccountClosureService.approveRequest();
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

    $scope.closureTypeChanged = function(model){
        if(angular.equals(model,"")){
            $scope.buttonText = "Search";
        } else{
            $scope.buttonText = "Submit";
        }
    };

    $scope.selectIndividual = function(row){
        console.log(row);
    };

    $scope.selectAll = function(rows){
        for(row in rows){
            console.log(rows[row].accountName);
        }
    };

    $scope.uploadFile =  function(){
        var f = document.getElementById('bulkUpload').files[0],
            r = new FileReader();
        r.onloadend = function(e){
            var data = e.target.result;
            //send file data here
            console.log(data);
        };
        r.readAsBinaryString(f);
    };

    //------------------------------------------- End of Dan Additions---------------------------------
    //Get user token
    var token = TokenStorage.retrieve();

    //Check if there's an active session
    if ($scope.isSessionActive(token) === true) {
        var user = JSON.parse(atob(token.split('.')[0]));
        $rootScope.authenticated = true;
        $rootScope.loggedInUser = user.usrName;
        $scope.getUserMenu();

        //Check if is Paybill Maker or checker
        var authorities = user.authorities;
        var auths = [];
        for (var i in authorities) {
            // console.log(authorities[i].authority);
            auths.push(authorities[i].authority);
        }

        //Evaluate Roles
        $scope.isPaybillMaker = auths.indexOf('ROLE_PAYBILL_MAKER') > -1;
        $scope.isPaybillChecker = auths.indexOf('ROLE_PAYBILL_CHECKER') > -1;

        //initialize Business
        if ($routeParams.bizId !== undefined) {
            //Get Company
            $scope.getBusinessNumber($routeParams.bizId)
                .success(function(data, status, headers, config) {
                    $scope.biz = data.payload;
                    $scope.showToast(data.message);
                })
                .error(function(data, status, headers, config) {
                    $scope.handleError(data, status, headers, config);
                });
        }

        //Business Number Table
        $scope.tableParams = new ngTableParams({
            page: 1, //Show First page
            count: 10 //count per page
        }, {
            total: 0, //length of data
            getData: function($defer, params) {
                //Ajax Request to API
                $scope.getBusinessNumbers(params)
                    .success(function(data, status, headers, config) {
                        var rData = {};
                        rData = data.payload;
                        var bizNos = rData.content;
                        params.total(rData.totalElements);
                        //set New Data
                        $defer.resolve(bizNos);
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

    //Show Menu Buttons
    $rootScope.hamburgerAvailable = true;
    $rootScope.menuAvailable = true;



    //Save Business Number
    $scope.save = function(biz) {
        console.log($scope.form);
        if ($scope.form.bizNoForm.$valid) {
            $scope.saveBiz(biz)
                .success(function(data, status, headers, config) {
                    $scope.showToast(data.message);
                    $scope.resetForm();
                })
                .error(function(data, status, headers, config) {
                    // console.log("Result: "+ data+"status: "+status);
                    $scope.handleError(data, status, headers, config);
                });
        }
    };


    //Update Business Number
    $scope.update = function(biz) {
        if ($scope.form.bizNoForm.$valid) {
            $scope.updateBusinessNumber(biz)
                .success(function(data, status, headers, config) {
                    $scope.biz = data.payload;
                    $scope.showToast(data.message);
                })
                .error(function(data, status, headers, config) {
                    $scope.handleError(data, status, headers, config);
                });
        }
    };

    $scope.resetForm = function() {
        $scope.biz = {};
    };


    //Approve Biz
    $scope.approveBiz = function(ev, biz) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
            .title('Approve Business Number')
            .content('Are you sure you want to approve this Business Number?')
            .ariaLabel('approve')
            .ok('Yes')
            .cancel('Cancel')
            .targetEvent(ev);
        $mdDialog.show(confirm).then(function() {
            $scope.approveRequest(biz)
                .success(function(data, status, headers, config) {
                    $scope.showToast(data.message);
                    $scope.tableParams.reload();
                })
                .error(function(data, status, headers, config) {
                    $scope.handleError(data, status, headers, config);
                });
        }, function() {
            // $scope.status = 'You decided to keep your debt.';
        });
    };

    //Reject biz
    $scope.rejectBiz = function(ev, biz) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
            .title('Reject Company')
            .content('Are you sure you want to reject this company?')
            .ariaLabel('approve')
            .ok('Yes')
            .cancel('Cancel')
            .targetEvent(ev);
        $mdDialog.show(confirm).then(function() {
            $scope.rejectRequest(biz)
                .success(function(data, status, headers, config) {
                    $scope.showToast(data.message);
                    $scope.tableParams.reload();
                })
                .error(function(data, status, headers, config) {
                    $scope.handleError(data, status, headers, config);
                });
        }, function() {
            // $scope.status = 'You decided to keep your debt.';
        });
    };



};

module.exports = AccountClosure;
