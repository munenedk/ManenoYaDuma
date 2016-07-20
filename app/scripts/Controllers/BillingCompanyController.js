/*jslint node: true */
/* global angular: false */
var BillingCompanyController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, TokenStorage, $location, $routeParams, LoginService, BillingCompanyService, BizNoService, UserService, AlertUtils) {
	//Inject Scope Methods
	$scope.getUserMenu = LoginService.loadMenu();
	$scope.getBillingCompanies = BillingCompanyService.listCompanies();
	$scope.saveBillingCompany = BillingCompanyService.save();
	$scope.getBillingCompany = BillingCompanyService.getCompany();
	$scope.updateBillingCompany = BillingCompanyService.updateCompany();

	$scope.getTarrif = BillingCompanyService.getTarrif();


	$scope.getAllBizNos = BizNoService.listAllBizNos();
	$scope.approveRequest = BillingCompanyService.approveRequest();
	$scope.rejectRequest = BillingCompanyService.rejectRequest();
	$scope.getAllBranches = UserService.listAllBranches();
	$scope.validateAccountNumber = BillingCompanyService.validateAccountNumber();
	$scope.isSessionActive = TokenStorage.isSessionActive();
	$scope.showToast = AlertUtils.showToast();
	$scope.showAlert = AlertUtils.showAlert();
	$scope.handleError = AlertUtils.handleError();

	//Get User Token
	var token = TokenStorage.retrieve();

	//User Roles Variables
	$scope.isPaybillMaker = false;
	$scope.isPaybillChecker = false;
	$rootScope.authenticated = false;

	/***##### Branch Search ######***/
	$scope.brSimulateQuery = false;
	$scope.brIsDisabled = false;
	$scope.brNoCache = false;
	var allBranches = "";

	/***##### BUSINESS NUMBER SEARCH ######***/
	$scope.bnSimulateQuery = false;
	$scope.bnIsDisabled = false;
	$scope.bnNoCache = false;
	var allBizNos = "";

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

		//initialize company
		if ($routeParams.companyId !== undefined) {
			//Get Company
			$scope.getBillingCompany($routeParams.companyId)
				.success(function(data, status, headers, config) {
					$scope.company = data.payload;
					$scope.showToast(data.message);
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}

		//Billing Company Table
		$scope.tableParams = new ngTableParams({
			page: 1, //Show First page
			count: 10 //count per page
		}, {
			total: 0, //length of data
			getData: function($defer, params) {
				//Ajax Request to API
				$scope.getBillingCompanies(params)
					.success(function(data, status, headers, config) {
						var rData = {};
						rData = data.payload;
						var companies = rData.content;
						params.total(rData.totalElements);
						//set New Data
						$defer.resolve(companies);
					})
					.error(function(data, status, headers, config) {
						$scope.handleError(data, status, headers, config);
					});
			}
		});

		//Load the branches
		getBranches();
		$scope.brQuerySearch = brQuerySearch;
		$scope.brSelectedItemChange = brSelectedItemChange;
		$scope.brSearchTextChange = brSearchTextChange;

		//Load All Business Numbers
		getBusinessNos();
		// console.log("Load All Method: " + loadAll());
		// console.log(self.branches);
		$scope.bnQuerySearch = querySearch;
		$scope.bnSelectedItemChange = selectedItemChange;
		$scope.bnSearchTextChange = searchTextChange;


	} else {
		TokenStorage.clear();
		$scope.showToast("Your Session has exprired. You have been redirected to the login page.");
		$location.path('/login');
	}

	//Show Menu Buttons
	$rootScope.hamburgerAvailable = true;
	$rootScope.menuAvailable = false;

	//Billing Company Form
	$scope.form = {};
	$scope.company = {};


	// added stuff
  $scope.tarrifs=[];
  $scope.tarrifsTypes = [];
 
  $scope.loadTarrifs = function() {
//  	console.log("Called Here");
  	
			$scope.getTarrif().success(function(data, status, headers, config) {
			 $scope.tarrifs = [];
		
			if(data.payload.length!=0) {
			for (var i = 0; i < data.payload.length; i++) {
			 	$scope.tarrifs.push(data.payload[i]);
		
				}
			$scope.tarrifsTypes = $scope.tarrifs;
      					
			}
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		 
	};  






	//Save Billing Company
	$scope.save = function(company,bizType) {
		if ($scope.form.billingCompany.$valid) {
			//Add Selected business number
			company.fkbusinessnum = $scope.selectedBizNo;
			company.branchName = $scope.selectedBranch;
			
			// company.charge = 1;
			// company.chargetype = "COMMISION";
			// company.charges ="1-%";

			$scope.saveBillingCompany(company,bizType)
				.success(function(data, status, headers, config) {
					$scope.showToast(data.message);
					$scope.resetForm();
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}else
		{
			$scope.showToast("PLEASE FILL IN ALL FIELDS");
		}
	};

	// Update Billing Company
	$scope.update = function(company) {
		if ($scope.form.billingCompany.$valid) {
			//Add Selected business number
			$scope.updateBillingCompany(company)
				.success(function(data, status, headers, config) {
					$scope.company = data.payload;
					$scope.showToast(data.message);
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}
	};

	//Validate Account
	$scope.validateAccount = function(accNo) {
//		console.log("ACCNO: " + accNo);
		if (accNo !== null) {
			if (accNo.length >= 10) {
				$scope.validateAccountNumber(accNo)
					.success(function(data, status, headers, config) {
//						console.log("Response: " + data);
						$scope.showToast(data.message);
						$scope.company.accountNumber = data.payload.accountNumber;
						$scope.company.accountTitle = data.payload.accountTitle;
					})
					.error(function(data, status, headers, config) {
						$scope.handleError(data, status, headers, config);
						$scope.company.accountNumber = null;
						$scope.company.accountTitle = null;
					});
			}
		}
	};

	$scope.resetForm = function() {
		$scope.company = {};
		$scope.bnSearchText = '';
		$scope.bnSelectedItem = undefined;
		$scope.brSelectedItem = undefined;
	};



	// Branch Query Search
	function querySearch(query) {
		var results = query ? $scope.bnBizNos.filter(createFilterFor(query)) : $scope.bnBizNos,
			deferred;
		if (self.simulateQuery) {
			deferred = $q.defer();
			$timeout(function() {
				deferred.resolve(results);
			}, Math.random() * 1000, false);
			return deferred.promise;
		} else {
//			console.log(results[0].display);
			return results;
		}
	}

	function searchTextChange(text) {
		console.log('Text changed to ' + text);
	}

	function selectedItemChange(item) {
		console.log('Item changed to ' + item.value);
		$scope.selectedBizNo = item.value;
		$scope.company.collectionAccount = $scope.selectedBizNo == 'lipa karo kcb account-522123' ? 'KES1403833330001' : 'KES1403822220001';
	}

	function getBusinessNos() {
		$scope.getAllBizNos()
			.success(function(data, status, headers, config) {
				var res = data.payload;
				for (var i in res) {
					 console.log(res[i]);
					var biz = res[i].accountName + "-" + res[i].businessNumber;
					allBizNos += "," + biz;
				}
				allBizNos = allBizNos.substring(1);
				$scope.bnBizNos = loadAllBizNos();
			})
			.error(function(data, status, headers, config) {
				$scope.handleError(data, status, headers, config);
			});
	}

	function loadAllBizNos() {
		if (allBizNos !== "") {
			return allBizNos.split(/,+/g).map(function(bizNo) {
				//console.log(bizNo);
				return {
					value: bizNo.toLowerCase(),
					display: bizNo
				};
			});
		} else {
			return null;
		}
	}

	function createFilterFor(query) {
		var lowercaseQuery = angular.lowercase(query);
		return function filterFn(bizNo) {
			return (bizNo.value.indexOf(lowercaseQuery) === 0);
		};
	}

	//Approve Company
	$scope.approveCompany = function(ev, company) {
		// Appending dialog to document.body to cover sidenav in docs app
		var confirm = $mdDialog.confirm()
			.title('Approve Company')
			.content('Are you sure you want to approve this company?')
			.ariaLabel('approve')
			.ok('Yes')
			.cancel('Cancel')
			.targetEvent(ev);
		$mdDialog.show(confirm).then(function() {
			$scope.approveRequest(company)
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

	//Reject Company
	$scope.rejectCompany = function(ev, company) {
		// Appending dialog to document.body to cover sidenav in docs app
		var confirm = $mdDialog.confirm()
			.title('Reject Company')
			.content('Are you sure you want to reject this company?')
			.ariaLabel('approve')
			.ok('Yes')
			.cancel('Cancel')
			.targetEvent(ev);
		$mdDialog.show(confirm).then(function() {
			$scope.rejectRequest(company)
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


	// Branch Query Search
	function brQuerySearch(query) {
		var results = query ? $scope.branches.filter(brCreateFilterFor(query)) : $scope.branches,
			deferred;
		if (self.simulateQuery) {
			deferred = $q.defer();
			$timeout(function() {
				deferred.resolve(results);
			}, Math.random() * 1000, false);
			return deferred.promise;
		} else {
			return results;
		}
	}

	function brSearchTextChange(text) {
		console.log('Text changed to ' + text);
	}

	function brSelectedItemChange(item) {
		console.log('Item changed to ' + item.value);
		$scope.selectedBranch = item.value;
	}

	function getBranches() {
		$scope.getAllBranches()
			.success(function(data, status, headers, config) {
				var res = data.payload;
				for (var i in res) {
					// console.log(res[i]);
					allBranches += res[i].brDaoName + ",";
				}
				allBranches += "'";
				$scope.branches = loadAllBranches();
			})
			.error(function(data, status, headers, config) {
				$scope.handleError(data, status, headers, config);
			});
	}

	function loadAllBranches() {
		if (allBranches !== "") {
			return allBranches.split(/,+/g).map(function(branch) {
				// console.log(bizNo);
				return {
					value: branch.toLowerCase(),
					display: branch
				};
			});
		} else {
			return null;
		}
	}

	function brCreateFilterFor(query) {
		var lowercaseQuery = angular.lowercase(query);
		return function filterFn(branch) {
			return (branch.value.indexOf(lowercaseQuery) === 0);
		};
	}

};

module.exports = BillingCompanyController;