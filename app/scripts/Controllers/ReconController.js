var ReconController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, FileUploader, dumaSettings, ReconService, TokenStorage, $location, $routeParams, FileSaver, Blob, LoginService, AlertUtils) {
  //Inject Service methods
  $scope.getUserMenu = LoginService.loadMenu();
  $scope.getUploads = ReconService.list();
  $scope.getRecons = ReconService.listRecons();
  $scope.getAllRecons = ReconService.listAllRecons();
  $scope.makeReconRequest = ReconService.submitReconRequest();
  $scope.getReconRequests = ReconService.listReconRequests();
  $scope.getAllRequests = ReconService.listAllRequests();
  $scope.submitRequests = ReconService.approveRequests();
  $scope.getReversalStatus = ReconService.listReversalStatus();
  $scope.getFile = ReconService.downloadFile();
  $scope.isSessionActive = TokenStorage.isSessionActive();
  $scope.showToast = AlertUtils.showToast();
  $scope.showAlert = AlertUtils.showAlert();
  $scope.handleError = AlertUtils.handleError();

  //check authentication
  var token = TokenStorage.retrieve();
  $rootScope.authenticated = false;

  //Recon Type
  $scope.reconType = $routeParams.reconType;

  //Selected Recons
  $scope.selectedRecons = [];
  $scope.selectedRequests = [];
  $scope.selectAllRecons = false;
  $scope.selectAllRequests = false;

  //Check boxes
  $scope.chckbox = {};
  $scope.a_chckbox = {};
  var data = [];

  //Show Divs
  $scope.showFileUpload = true;
  $scope.showFileProcessing = false;
  $scope.showFileDetails = true;
  $scope.showProcessing = false;

  if ($scope.isSessionActive(token) === true) {
    var user = JSON.parse(atob(token.split('.')[0]));
    $rootScope.authenticated = true;
    $rootScope.loggedInUser = user.usrName;
    $scope.getUserMenu();

    //Upload Table
    $scope.uploadParams = new ngTableParams({
      page: 1, //Show First page
      count: 10 //count per page
    }, {
      total: 0, //length of data
      getData: function($defer, params) {
        //Ajax Request to API
        $scope.getUploads(params, $routeParams.reconType)
          .success(function(data, status, headers, config) {
            var rData = {};
            rData = data.payload.content;
            var uploads = rData;
            params.total(rData.totalElements);
            //set New Data
            $defer.resolve(uploads);
          })
          .error(function(data, status, headers, config) {
            $scope.handleError(data, status, headers, config);
          });
      }
    });


    //Recon File Table
    $scope.reconParams = new ngTableParams({
      page: 1, //Show First page
      count: 10 //count per page
    }, {
      total: 0, //length of data
      getData: function($defer, params) {
        //Ajax Request to API
        $scope.getRecons(params, $routeParams.uploadId, $routeParams.reconType)
          .success(function(data, status, headers, config) {
            var rData = {};
            rData = data.payload;
            var recons = rData.content;
            console.log(recons);
            params.total(rData.totalElements);
            //set New Data
            $defer.resolve(recons);
          })
          .error(function(data, status, headers, config) {
            $scope.handleError(data, status, headers, config);
          });
      }
    });


    //Approval Table
    $scope.requestsParams = new ngTableParams({
      page: 1, //Show First page
      count: 10 //count per page
    }, {
      total: 0, //length of data
      getData: function($defer, params) {
        //Ajax Request to API
        $scope.getReconRequests(params, $routeParams.requestUploadId, $routeParams.reconType)
          .success(function(data, status, headers, config) {
            var rData = {};
            rData = data.payload;
            var requests = rData.content;
            params.total(rData.totalElements);
            //set New Data
            $defer.resolve(requests);
          })
          .error(function(data, status, headers, config) {
            $scope.handleError(data, status, headers, config);
          });
      }
    });

    //Requests Table
    $scope.reversalStatusParams = new ngTableParams({
      page: 1, //Show First page
      count: 10 //count per page
    }, {
      total: 0, //length of data
      getData: function($defer, params) {
        //Ajax Request to API
        $scope.getReversalStatus(params, $routeParams.uploadId, $routeParams.reconType)
          .success(function(data, status, headers, config) {
            var rData = {};
            rData = data.payload;
            var reversals = rData.content;
            // console.log(reversals);
            params.total(rData.totalElements);
            //set New Data
            $defer.resolve(reversals);
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
  $rootScope.menuAvailable = false;

  //Error Messages
  var redirectMsg = ". Your session has expired. You will now be redirected";
  var forbiddenMsg = ". You do not have permission to use this resource";

  //Load Selected File Details
  $scope.loadFileDetails = function(uploadId, status, reconType) {
    var token = TokenStorage.retrieve();
    token = JSON.parse(atob(token.split('.')[0]));

    //Extract Authorities
    var authorities = token.authorities;
    var auths = [];
    for (var i in authorities) {
      auths.push(authorities[i].authority);
    }

    if (status === '1') { //Maker 
      if (auths.indexOf("ROLE_RECON_MAKER") > -1) {
        $location.path('/mpesaRecon-file/' + reconType + "/" + uploadId);
      } else {
        $scope.showAlert("403", "You Don't Have The required Privileges to Proceed");
      }
    } else if (status === '3') { //Checker
      if (auths.indexOf("ROLE_RECON_CHECKER") > -1) {
        $location.path('/mpesaRecon-requests/' + reconType + "/" + uploadId);
      } else {
        $scope.showAlert("403", "You Don't Have The required Privileges to Proceed");
      }
    } else if (status === "4") { //Transactions Qued for reversal
      $location.path('/mpesaRecon-status/' + reconType + "/" + uploadId);
    }
  };

  //Toggle Selected Recons
  $scope.toggleSelectedRecons = function(recon) {
    var idx = $scope.selectedRecons.indexOf(recon);
    //is Currently selected
    if (idx > -1) {
      $scope.selectedRecons.splice(idx, 1);
    }
    //is newly selected
    else {
      $scope.selectedRecons.push(recon);
    }
  };

  //Toggle Selected Requests
  $scope.toggleSelectedRequests = function(request) {
    var idx = $scope.selectedRequests.indexOf(request);
    //is Currently selected
    if (idx > -1) {
      $scope.selectedRequests.splice(idx, 1);
    }
    //is newly selected
    else {
      $scope.selectedRequests.push(request);
    }
  };

  // Toggle select all Recons
  $scope.toggleSelectAllRecons = function() {
    if ($scope.selectAllRecons) { //Selected -  So Clear
      $scope.selectedRecons = [];
      for (var c in $scope.chckbox) {
        $scope.chckbox[c] = false;
      }
      $scope.selectAllRecons = false;
    } else { //Not Selected - Select
      $scope.getAllRecons($routeParams.uploadId, $routeParams.reconType)
        .success(function(data, status, headers, config) {
          var res = data.payload;
          for (var i in res) {
            if (res[i].processingStatus === "1") { //Only Push Valid Transactions
              $scope.toggleSelectedRecons(res[i]);
              $scope.chckbox[res[i].id] = true;
            }
          }
          $scope.selectAllRecons = true;
        })
        .error(function(data, status, headers, config) {
          $scope.selectedRecons = [];
          $scope.handleError(data, status, headers, config);
        });
    }
  };

  //Toggle select all Requests
  $scope.toggleSelectAllRequests = function() {
    if ($scope.selectAllRequests) { //Selected - So Clear
      $scope.selectedRequests = [];
      for (var c in $scope.a_chckbox) {
        $scope.a_chckbox[c] = false;
      }
      $scope.selectAllRequests = false;
    } else { // Not Selected - so Select
      $scope.getAllRequests($routeParams.requestUploadId)
        .success(function(data, status, headers, config) {
          var res = data.payload;
          for (var i in res) {
            $scope.toggleSelectedRequests(res[i]);
            $scope.a_chckbox[res[i].mrId] = true;
          }
          $scope.selectAllRequests = true;
        })
        .error(function(data, status, headers, config) {
          $scope.selectedRequests = [];
          $scope.handleError(data, status, headers, config);
        });
    }
  };

  $scope.submitRecon = function() {
    if ($scope.selectedRecons.length > 0) {
      $scope.showFileDetails = false;
      $scope.showProcessing = true;
      $scope.makeReconRequest($routeParams.uploadId, $scope.selectedRecons, $routeParams.reconType)
        .success(function(data, status, headers, config) {
          $scope.showFileDetails = true;
          $scope.showProcessing = false;
          $scope.showToast(data.message);
        })
        .error(function(data, status, headers, config) {
          $scope.showFileDetails = true;
          $scope.showProcessing = false;
          $scope.handleError(data, status, headers, config);
        });
    } else {
      $scope.showAlert("100", "Select At Least One Transaction");
    }
  };

  $scope.approveRequests = function() {
    if ($scope.selectedRequests.length > 0) {
      $scope.showFileDetails = false;
      $scope.showProcessing = true;
      $scope.submitRequests($scope.selectedRequests, $routeParams.reconType)
        .success(function(data, status, headers, config) {
          $scope.showFileDetails = true;
          $scope.showProcessing = false;
          $scope.showToast(data.message);
        })
        .error(function(data, status, headers, config) {
          $scope.showFileDetails = true;
          $scope.showProcessing = false;
          $scope.handleError(data, status, headers, config);
        });
    } else {
      $scope.showAlert("100", "Select At Least One Transaction");
    }
  };

  //File Uploader
  var backendUrl = dumaSettings.backendUrl + "mpesaRecon/upload/" + $scope.reconType;
  var uploader = $scope.uploader = new FileUploader({
    url: backendUrl,
    headers: {
      'X-AUTH-TOKEN': TokenStorage.retrieve()
    }
  });

  // FILTERS
  // uploader.filters.push({
  //  name: 'customFilter',
  //  fn: function(item /*{File|FileLikeObject}*/, options) {
  //    return this.queue.length < 10;
  //  }
  // });

  uploader.filters.push({
    name: 'fileTypeFilter',
    fn: function(item) {
      // return !uploader.hasHTML5 ? true : /\/(png|jpeg|jpg|gif)$/.test(item.file.type);
      return !uploader.hasHTML5 ? true : /\/(csv)$/.test(item.file.type);
    }
  });

  //Call backs
  uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/ , filter, options) {
    console.info('onWhenAddingFileFailed', item, filter, options);
  };
  uploader.onAfterAddingFile = function(fileItem) {
    console.info('onAfterAddingFile', fileItem);
  };
  uploader.onAfterAddingAll = function(addedFileItems) {
    console.info('onAfterAddingAll', addedFileItems);
  };
  uploader.onBeforeUploadItem = function(item) {
    console.info('onBeforeUploadItem', item);
  };
  uploader.onProgressItem = function(fileItem, progress) {
    console.info('onProgressItem', fileItem, progress);
  };
  uploader.onProgressAll = function(progress) {
    console.info('onProgressAll', progress);
    $scope.showFileUpload = false;
    $scope.showFileProcessing = true;
  };
  uploader.onSuccessItem = function(fileItem, response, status, headers) {
    // console.info('onSuccessItem', fileItem, response, status, headers);
    console.info("onSuccessItem", fileItem, response, status, headers);
    //Hide File Processing
    $scope.showFileUpload = true;
    $scope.showFileProcessing = false;
    //Show success message
    $scope.showToast(response.message);
  };
  uploader.onErrorItem = function(fileItem, response, status, headers) {
    //Hide File Processing
    $scope.showFileUpload = true;
    $scope.showFileProcessing = false;
    console.info('onErrorItem', fileItem, response, status, headers);
    if (status === 401) { //Unauthorized
      $scope.showAlert(status, response.message + redirectMsg);
      $location.path('/home');
    } else if (status === 403) { //Forbidden
      $scope.showAlert(status, response.message + forbiddenMsg);
    } else {
      $scope.showAlert(status, response.message);
    }
  };
  uploader.onCancelItem = function(fileItem, response, status, headers) {
    console.info('onCancelItem', fileItem, response, status, headers);
  };
  uploader.onCompleteItem = function(fileItem, response, status, headers) {
    console.info('onCompleteItem', fileItem, response, status, headers);
  };
  uploader.onCompleteAll = function() {
    console.info('onCompleteAll');
  };
  // console.info('uploader', uploader);

  //Donwload File
  $scope.downloadFile = function() {
    $scope.getFile($routeParams.reconType, $routeParams.uploadId)
      .success(function(data, status, headers, config) {
        var fileData = new Blob([data], {
          // type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;' //XLSX
          type: 'application/vnd.ms-excel; ' //XLS
        });

        var fileName = $routeParams.reconType.toLowerCase() == 'c2b' ? "C2BReversals" : "B2CReversals";
        var fileConfig = {
          data: fileData,
          filename: fileName
        };
        FileSaver.saveAs(fileConfig);
      })
      // download: fileName
      .error(function(data, status, headers, config) {
        $scope.handleError(data, status, headers, config);
      });
  };
};

module.exports = ReconController;