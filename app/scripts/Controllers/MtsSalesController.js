/*jslint node: true */
/* global angular: false */
var MtsSalesController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage, $location, FileUploader, dumaSettings, FileSaver, Blob, $routeParams, MtsSalesService, LoginService,AlertUtils) {
	//Inject Service methods to scope
	$scope.getUserMenu = LoginService.loadMenu();
	$scope.getUploads = MtsSalesService.listUploads();
	$scope.getFileDetails = MtsSalesService.fileDetails();
	$scope.getOpenedAccounts = MtsSalesService.openedAccounts();
	$scope.getFile = MtsSalesService.downloadFile();
	$scope.isSessionActive = TokenStorage.isSessionActive();
	$scope.showToast = AlertUtils.showToast();
	$scope.showAlert = AlertUtils.showAlert();
	$scope.handleError = AlertUtils.handleError();

	//Get user token
	var token = TokenStorage.retrieve();
	$rootScope.authenticated = false;

	//Check if there's active session
	if ($scope.isSessionActive(token) === true) {
		var user = JSON.parse(atob(token.split('.')[0]));
		$rootScope.authenticated = true;
		$rootScope.loggedInUser = user.usrName;
		$scope.getUserMenu();

		//Initialize Date Pickers
		angular.element(".datepicker").pickadate({
			selectMonths: true,
			selectYears: 15,
			max:true
		});

		//Uploads Table
		$scope.uploadParams = new ngTableParams({
			page: 1, //Show First page
			count: 10 //count per page
		}, {
			total: 0, //length of data
			getData: function($defer, params) {
				//Ajax Request to API
				$scope.getUploads(params)
					.success(function(data, status, headers, config) {
						var rData = {};
						rData = data.payload;
						var uploads = rData.content;
						console.log(uploads);
						params.total(rData.totalElements);
						//set New Data
						$defer.resolve(uploads);
					})
					.error(function(data, status, headers, config) {
						$scope.handleError(data, status, headers, config);
					});
			}
		});

		//Upload File Details Table
		$scope.fileDetailsParams = new ngTableParams({
			page: 1, //Show First page
			count: 10 //count per page
		}, {
			total: 0, //length of data
			getData: function($defer, params) {
				//Ajax Request to API
				$scope.getFileDetails(params, $routeParams.uploadId)
					.success(function(data, status, headers, config) {
						var rData = {};
						rData = data.payload;
						var fileDetails = rData.content;
						console.log(fileDetails);
						params.total(rData.totalElements);
						//set New Data
						$defer.resolve(fileDetails);
					})
					.error(function(data, status, headers, config) {
						$scope.handleError(data, status, headers, config);
					});
			}
		});

		//Opened Accounts File Details Table
		$scope.openedAccountsParams = new ngTableParams({
			page: 1, //Show First page
			count: 10 //count per page
		}, {
			total: 0, //length of data
			getData: function($defer, params) {
				$scope.showSearchProgress = true;
				//Ajax Request to API
				$scope.getOpenedAccounts(params, $scope.staffId, $scope.dateRange)
					.success(function(data, status, headers, config) {
						$scope.showSearchProgress = false;
						var rData = {};
						rData = data.payload;
						// console.log(data);
						var fileDetails = rData.content;
						params.total(rData.totalElements);
						//set New Data
						$defer.resolve(fileDetails);
					})
					.error(function(data, status, headers, config) {
						$scope.showSearchProgress = false;
						$scope.handleError(data, status, headers, config);
					});
			}
		});

	} else {
		TokenStorage.clear();
		$scope.showToast("Your Session has exprired. You have been redirected to the login page.");
		$location.path('/login');
	}

	//Menu
	$rootScope.hamburgerAvailable = true;
	$rootScope.menuAvailable = false;

	//Show upload div
	$scope.showFileUpload = true;
	$scope.showFileProcessing = false;

	//Show Search DIVs
	$scope.showSearchByStaffId = false;
	$scope.showSearchByDate = false;
	$scope.showSearchProgress = false;

	//Init Data
	$scope.staffId = "";
	$scope.dateRange = "";

	//File Uploader
	var backendUrl = dumaSettings.backendUrl + "mtsSales/upload";
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
		$scope.showFileUpload = true;
		$scope.showFileProcessing = false;
		// $scope.showToast(response.message);
		$scope.showAlert(status, response.message);
	};
	uploader.onErrorItem = function(fileItem, response, status, headers) {
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
		$scope.getFile($scope.staffId, $scope.dateRange)
			.success(function(data, status, headers, config) {
				var fileData = new Blob([data], {
					type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;' //XLSX
						//type: 'application/vnd.ms-excel;' //XLS
				});
				var fileConfig = {
					"data": fileData,
					"filename": "NewAccounts.xlsx"
				};
				FileSaver.saveAs(fileConfig);
			})
			.error(function(data, status, headers, config) {
				$scope.handleError(data, status, headers, config);
			});
	};

	//Get Staff Uploads
	$scope.searchStaffUploads = function(staffId) {
		$scope.staffId = staffId;
		$scope.dateRange = "";
		$scope.openedAccountsParams.reload();
	};

	$scope.searchByDate = function(dateRange) {
		$scope.dateRange = dateRange;
		$scope.staffId = "";
		$scope.openedAccountsParams.reload();
	};

	$scope.toggleSearchAccounts = function(searchType) {
		if (searchType === 'all') {
			$scope.showSearchByStaffId = false;
			$scope.showSearchByDate = false;
			$scope.openedAccountsParams.reload();
		} else if (searchType === 'date') {
			$scope.showSearchByStaffId = false;
			$scope.showSearchByDate = true;
		} else if (searchType === 'staffId') {
			$scope.showSearchByStaffId = true;
			$scope.showSearchByDate = false;
		}
	};

	//Load File Details
	$scope.loadFileDetails = function(uploadId) {
		$location.path("/mk-ambassadors-file-details/" + uploadId);
	};

};

module.exports = MtsSalesController;