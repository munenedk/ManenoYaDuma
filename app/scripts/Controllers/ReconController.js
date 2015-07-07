var ReconController = function($scope,$rootScope,$mdDialog,$mdToast,ngTableParams,FileUploader,dumaSettings,ReconService,TokenStorage,$location,$routeParams){
//Show Menu Buttons
$rootScope.hamburgerAvailable = true;
$rootScope.menuAvailable=true;

//Inject Service methods
$scope.getUploads = ReconService.list();
$scope.getRecons = ReconService.listRecons();
$scope.getAllRecons = ReconService.listAllRecons();
$scope.makeReconRequest = ReconService.submitReconRequest();
$scope.getReconRequests = ReconService.listReconRequests();
$scope.getAllRequests = ReconService.listAllRequests();

//Selected Recons
$scope.selectedRecons = [];
$scope.selectedRequests=[];
$scope.selectAllRecons =  false;
$scope.selectAllRequests = false;

var data = [];

var redirectMsg = ". Your session has expired. You will now be redirected";

//Toast Position
$scope.toastPosition = {
	bottom:false,
	top:true,
	left:false,
	right:true
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
	$scope.showToast = function(message){
		$mdToast.show(
			$mdToast.simple()
			.content(message)
			.position($scope.getToastPosition())
			.hideDelay(5000)
			);
	};

	//Alerts
	$scope.alert = "";
	$scope.showAlert = function(status,message){
		$mdDialog.show(
			$mdDialog.alert()
			.title("Error "+status)
			.content(message)
			.ariaLabel('Error Notification')
			.ok('Ok')
		// .targetEvent(ev)
		);
	};

	//Load Selected File Details
	$scope.loadFileDetails = function(uploadId,status){
    if(status === '1'){
      $location.path('/mpesaRecon-file/'+uploadId);
    }else if(status === '3'){
      $location.path('/mpesaRecon-requests/'+uploadId);
    }
  };

	//Toggle Selected Recons
	$scope.toggleSelectedRecons = function(recon){
		var idx = $scope.selectedRecons.indexOf(recon);

			//is Currently selected
			if(idx > -1){
				$scope.selectedRecons.splice(idx,1);
			}

			//is newly selected
			else{
				$scope.selectedRecons.push(recon);
			}
		};

  //Toggle Selected Requests
  $scope.toggleSelectedRequests = function(request){
    var idx = $scope.selectedRequests.indexOf(request);

      //is Currently selected
      if(idx > -1){
        $scope.selectedRequests.splice(idx,1);
      }

      //is newly selected
      else{
        $scope.selectedRequests.push(request);
      }
    };

    //Toggle select all Recons
    $scope.toggleSelectAllRecons = function(){
      if($scope.selectAllRecons){
        $scope.selectAllRecons = false;
        $scope.selectedRecons = [];
      }else{
        $scope.selectAllRecons = true;
        $scope.getAllRecons($routeParams.uploadId)
        .success(function(data,status,headers,config){
          var res = data.payload;
          for(var i in res){
            if(res[i].processingStatus === "1"){//Only Push Valid Transactions
              console.log("Processing Status: "+res[i].processingStatus);
              $scope.toggleSelectedRecons(res[i]);
            }
          }
        })
        .error(function(data,status,headers,config){
         $scope.selectedRecons = [];
         var msg = data === null?"N/A":data.status +" : "+data.message;
         if(status === 401 || status ===403){
          $scope.showAlert(status,msg+redirectMsg);
        }else{
          $scope.showAlert(status,msg);
        }
      });
      }
    };

        //Toggle select all Requests
        $scope.toggleSelectAllRequests = function(){
          if($scope.selectAllRequests){
            $scope.selectAllRequests = false;
            $scope.selectedRequests = [];
          }else{
            $scope.selectAllRequests = true;
            $scope.getAllRequests($routeParams.requestUploadId)
            .success(function(data,status,headers,config){
              var res = data.payload;
              for(var i in res){
                $scope.toggleSelectedRequests(res[i]);
              }
            })
            .error(function(data,status,headers,config){
             $scope.selectedRequests = [];
             var msg = data === null?"N/A":data.status +" : "+data.message;
             if(status === 401 || status ===403){
              $scope.showAlert(status,msg+redirectMsg);
            }else{
              $scope.showAlert(status,msg);
            }
          });
          }
        };

        $scope.submitRecon =  function(){
          if($scope.selectedRecons.length > 0){
            $scope.makeReconRequest($routeParams.uploadId,$scope.selectedRecons)
            .success(function(data,status,headers,config){
              $scope.showToast(data.message);
            })
            .error(function(data,status,headers,config){
              var msg = data === null?"N/A":data.status +" : "+data.message;
              if(status === 401 || status ===403){
                $scope.showAlert(status,msg+redirectMsg);
              }else{
                $scope.showAlert(status,msg);
              }
            });
          }else{
            $scope.showAlert("100","Select At Least One Transaction");
          }
        };

        $scope.approveRequests = function(){
          if(scope.selectedRequests.length > 0){
            $scope.submitRequests($routeParams.requestUploadId,$scope.selectedRequests)
            .success(function(data,status,headers,config){
              $scope.showToast(data.message);
            })
            .error(function(data,status,headers,config){
             var msg = data === null?"N/A":data.status +" : "+data.message;
             if(status === 401 || status ===403){
              $scope.showAlert(status,msg+redirectMsg);
            }else{
              $scope.showAlert(status,msg);
            }
          });
          }else{
            $scope.showAlert("100","Select At Least One Transaction");
          }
        };
        

	//File Uploader
	var backendUrl = dumaSettings.backendUrl+"mpesaRecon/upload";
	var token = TokenStorage.retrieve();
	var uploader = $scope.uploader = new FileUploader({
		url: backendUrl,
		headers:{'X-AUTH-TOKEN':token}
	});

	 // FILTERS
	 // uploader.filters.push({
	 // 	name: 'customFilter',
	 // 	fn: function(item /*{File|FileLikeObject}*/, options) {
	 // 		return this.queue.length < 10;
	 // 	}
	 // });

uploader.filters.push({
	name: 'fileTypeFilter',
	fn: function(item) {
	// return !uploader.hasHTML5 ? true : /\/(png|jpeg|jpg|gif)$/.test(item.file.type);
	return !uploader.hasHTML5 ? true : /\/(csv)$/.test(item.file.type);
}
});

	 //Call backs
	 uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
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
	 };
	 uploader.onSuccessItem = function(fileItem, response, status, headers) {
		// console.info('onSuccessItem', fileItem, response, status, headers);
		$scope.showToast(response.message);
	};
	uploader.onErrorItem = function(fileItem, response, status, headers) {
		console.info('onErrorItem', fileItem, response, status, headers);
		if(status === 401 || status === 403){
      $scope.showAlert(status,response.message+redirectMsg);
      $location.path('/home');
    }else{
      $scope.showAlert(status,response.message);
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


	//Upload Table
	$scope.uploadParams = new ngTableParams({
	page:1,		//Show First page
	count:10	//count per page
},{
	total: 0, //length of data
	getData:function($defer,params){
		//Ajax Request to API
		$scope.getUploads(params)
		.success(function(data,status,headers,config){
			var rData = {};
			rData = data.payload;
			// console.log(JSON.stringify(rData));

			var uploads = rData;

			params.total(rData.totalElements);

			//set New Data
			$defer.resolve(uploads);
		})
		.error(function(data,status,headers,config){
      var msg = data === null ? "N/A" : data.error +" : "+data.message;
      if(status === 401 || status === 403){
        $scope.showAlert(status,msg+redirectMsg);
        $location.path('/home');
      }else{
        $scope.showAlert(status,msg);
      }

    });
	}
});


	//Recon File Table
	$scope.reconParams = new ngTableParams({
	page:1,		//Show First page
	count:10	//count per page
},{
	total: 0, //length of data
	getData:function($defer,params){
		//Ajax Request to API
		$scope.getRecons(params,$routeParams.uploadId)
		.success(function(data,status,headers,config){
			var rData = {};
			rData = data.payload;
			// console.log(JSON.stringify(rData));

			var recons = rData.content;

			params.total(rData.totalElements);

			//set New Data
			$defer.resolve(recons);
		})
		.error(function(data,status,headers,config){
			var	msg = data === null? "N/A":data.error +" : "+data.message;
     if(status === 401 || status === 403){
      $scope.showAlert(status,msg+redirectMsg);
      $location.path('/home');
    }else{
      $scope.showAlert(status,msg);
    }
  });
	}
});


    //Approval Table
    $scope.requestsParams = new ngTableParams({
  page:1,   //Show First page
  count:10  //count per page
},{
  total: 0, //length of data
  getData:function($defer,params){
    //Ajax Request to API
    $scope.getReconRequests(params,$routeParams.requestUploadId)
    .success(function(data,status,headers,config){
      var rData = {};
      rData = data.payload;
      // console.log(JSON.stringify(rData));

      var requests = rData.content;

      params.total(rData.totalElements);

      //set New Data
      $defer.resolve(requests);
    })
    .error(function(data,status,headers,config){
      var msg = data === null? "N/A":data.status +" : "+data.message;
      if(status === 401 || status === 403){
        $scope.showAlert(status,msg+redirectMsg);
        $location.path('/home');
      }else{
        $scope.showAlert(status,msg);
      }
    });
  }
});

  };


  module.exports = ReconController;