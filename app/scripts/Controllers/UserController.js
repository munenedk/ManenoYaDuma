/*jslint node: true */
/* global angular: false */
var UserController = function($scope, $rootScope, $mdDialog, $mdToast, ngTableParams, UserService, RolesService, $routeParams, TokenStorage, $location, LoginService, BillingCompanyService, AlertUtils) {
	//Inject Service methods to scope
	$scope.getUserMenu = LoginService.loadMenu();
	$scope.getUsers = UserService.list();
	$scope.getUser = UserService.find();
	$scope.saveUser = UserService.save();
	$scope.getRoles = RolesService.list();
	$scope.getAllBranches = UserService.listAllBranches();
	$scope.getAllBillers = BillingCompanyService.getAllBillingCompanies();
	$scope.updateUser = UserService.updateUser();
	$scope.updateUsrRoles = UserService.updateUserRoles();
	$scope.isSessionActive = TokenStorage.isSessionActive();
	$scope.showToast = AlertUtils.showToast();
	$scope.showAlert = AlertUtils.showAlert();
	$scope.handleError = AlertUtils.handleError();


	//check authentication
	var token = TokenStorage.retrieve();
	$rootScope.authenticated = false;

	//Manage Tabs
	$scope.selectedTab = 0;
	$scope.userDetailsTabDisabled = false;
	$scope.userRolesTabDisabled = true;

	//save progress
	$scope.showSaveProgress = false;

	//Selected Roles
	$scope.selectedRoles = [];

	//Roles checkbox
	$scope.rolesChckbox = {};

	/***##### BRANCH SEARCH ######***/
	$scope.acSimulateQuery = false;
	$scope.acIsDisabled = false;
	$scope.acNoCache = false;
	var allBranches = "'";


	/***##### BILLING COMPANY SEARCH ####***/
	$scope.billerSimulateQuery = false;
	$scope.billerIsDisabled = false;
	$scope.billerNoCache = false;
	var allBillers = "'";

	//Check if there's an active session
	if ($scope.isSessionActive(token) === true) {
		var usr = JSON.parse(atob(token.split('.')[0]));
		$rootScope.authenticated = true;
		$rootScope.loggedInUser = usr.usrName;
		$scope.getUserMenu();

		//initialize user
		if ($routeParams.userId !== undefined) {
			//Get User
			$scope.getUser($routeParams.userId)
				.success(function(data, status, headers, config) {
					$scope.user = data.payload.user;
					$scope.user.usrStatus = 0 ? 'New' : 1 ? 'Active' : 2 ? 'Disabled' : 'Unknown';
					var userRoles = data.payload.userRoles;
					//Preselect User Roles
					for (var i in userRoles) {
						$scope.toggleSelectedRole(userRoles[i]);
						$scope.rolesChckbox[userRoles[i].roleId] = true;
					}
					$scope.showToast(data.message);
				})
				.error(function(data, status, headers, config) {
					$scope.handleError(data, status, headers, config);
				});
		}

		//User Table
		$scope.tableParams = new ngTableParams({
			page: 1, //Show first page
			count: 10, //count per page
		}, {
			total: 0,
			getData: function($defer, params) {
				//ajax request to api
				$scope.getUsers(params)
					.success(function(data, status, headers, config) {
						var rData = {};
						rData = data.payload;
						// console.log(JSON.stringify(rData));
						var users = rData.content;
						params.total(rData.totalElements);
						//set New data
						$defer.resolve(users);
					})
					.error(function(data, status, headers, config) {
						var msg = "N/A";
						if (data !== null) {
							msg = data.error + " : " + data.message;
						}
						$scope.showAlert(status, msg);
						// alert("Error! "+status);
					});
			}
		});

		//Roles Table
		$scope.roleTableParams = new ngTableParams({
			page: 1, //Show first page
			count: 10, //count per page
		}, {
			total: 0,
			getData: function($defer, params) {
				//ajax request to api
				$scope.getRoles(params)
					.success(function(data, status, headers, config) {
						var rData = {};
						rData = data.payload;

						var roles = rData.content;

						params.total(rData.totalElements);
						//set New data
						$defer.resolve(roles);
					})
					.error(function(data, status, headers, config) {
						var msg = "N/A";
						if (data !== null) {
							msg = data.error + " : " + data.message;
						}
						$scope.showAlert(status, msg);
					});
			}
		});

		//Load the Branches
		getBranches();
		// console.log("Load All Method: " + loadAll());
		// console.log(self.branches);
		$scope.acQuerySearch = querySearch;
		$scope.acSelectedItemChange = selectedItemChange;
		$scope.acSearchTextChange = searchTextChange;


		//Load the billers
		getBillers();
		// console.log("Load All Method: " + loadAll());
		// console.log(self.branches);
		$scope.billerQuerySearch = billerQuerySearch;
		$scope.billerSelectedItemChange = billerSelectedItemChange;
		$scope.billerSearchTextChange = billerSearchTextChange;

	} else {
		TokenStorage.clear();
		$scope.showToast("Your Session has exprired. You have been redirected to the login page.");
		$location.path('/login');
	}

	//Show Menu Buttons
	$rootScope.hamburgerAvailable = true;
	$rootScope.menuAvailable = false;

	//form
	$scope.form = {};

	$scope.setUser = function(user) {
		console.log("SETTING USER....");
		if ($scope.form.userForm.$valid) {
			$scope.userDetailsTabDisabled = true;
			$scope.userRolesTabDisabled = false;
			$scope.user = user;
			$scope.user.branchName = $scope.selectedBranch;
			$scope.user.billingCompanyName = $scope.selectedBiller;
			// console.log("Selected Branch Name: "+$scope.user.branchName);
			$scope.selectedTab = 1;
		}else{
			$scope.showAlert("01","Select All Required Fields");
		}
	};

	//Save user
	$scope.save = function() {
		var userContext = {
			'user': $scope.user,
			'roles': $scope.selectedRoles
		};
		//Show Progress
		$scope.showSaveProgress = true;
		$scope.saveUser(userContext)
			.success(function(data, status, headers, config) {
				$scope.showSaveProgress = false;
				$scope.showToast(data.message);
				$scope.resetForm();
			}).error(function(data, status, headers, config) {
				$scope.showSaveProgress = false;
				$scope.showAlert(status, data.message);
			});
	};

	//Update user
	$scope.update = function(user) {
		user.usrStatus = 'New' ? 0 : 'Active' ? 1 : 'Disabled' ? 2 : 3;
		// console.log(JSON.stringify(user));
		$scope.updateUser(user)
			.success(function(data, status, headers, config) {
				$scope.user = data.payload;
				$scope.user.usrStatus = 0 ? 'New' : 1 ? 'Active' : 2 ? 'Disabled' : 'Unknown';
				$scope.showToast(data.message);
			})
			.error(function(data, status, headers, config) {
				$scope.showAlert(status, data.message);
			});
	};

	//Update User roles
	$scope.updateUserRoles = function() {
		var usr = $scope.user;
		usr.usrStatus = 'New' ? 0 : 'Active' ? 1 : 'Disabled' ? 2 : 3;
		console.log("User Roles Selected: " + JSON.stringify($scope.selectedRoles));
		var userContext = {
			'user': usr,
			'roles': $scope.selectedRoles
		};

		$scope.showSaveProgress = true;
		$scope.updateUsrRoles(userContext)
			.success(function(data, status, headers, config) {
				$scope.showToast(data.message);
			})
			.error(function(data, status, headers, config) {
				$scope.showAlert(status, data.message);
			});
	};

	//Reset User Form
	$scope.resetForm = function() {
		$scope.user = {
			userId: '',
			name: '',
			email: '',
			dateCreated: '',
			lastPasswordChange: '',
			status: ''
		};
	};

	$scope.toggleSelectedRole = function(role) {
		// console.log(JSON.stringify(role));
		// var idx = $scope.selectedRoles.indexOf(role);
		var idx = -1;
		for (var i = 0; i < $scope.selectedRoles.length; i++) {
			if (JSON.stringify($scope.selectedRoles[i]) === JSON.stringify(role)) {
				idx = i;
			}
		}
		console.log("IDX: " + idx);

		//is Currently selected
		if (idx > -1) {
			//If Is selected Remove It
			$scope.selectedRoles.splice(idx, 1);
		} else {
			//If is not selected push to array
			$scope.selectedRoles.push(role);
		}
		console.log($scope.selectedRoles);
	};

	$scope.restart = function() {
		$scope.resetForm();
		$scope.selectedRole.length = 0;
		$scope.roleDetailsTabDisabled = false;
		$scope.userDetailsTabDisabled = true;
		$scope.selectedTab = 0;
	};

	// Branch Query Search
	function querySearch(query) {
		var results = query ? $scope.acBranches.filter(createFilterFor(query)) : $scope.acBranches,
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

	function searchTextChange(text) {
		console.log('Text changed to ' + text);
	}

	function selectedItemChange(item) {
		console.log('Item changed to ' + item.value);
		$scope.selectedBranch = item.value;
	}

	function getBranches() {
		$scope.getAllBranches()
			.success(function(data, status, headers, config) {
				var res = data.payload;
				for (var i in res) {
					allBranches += res[i].brDaoName + ",";
				}
				allBranches += "'";
				// console.log(allBranches);
				$scope.acBranches = loadAll();
			})
			.error(function(data, status, headers, config) {
				$scope.handleError(data, status, headers, config);
			});
	}

	function loadAll() {
		if (allBranches != "'") {
			return allBranches.split(/,+/g).map(function(branch) {
				// return allBranches.split(",").map(function(branch) {
				// console.log("Branch Is: "+branch);
				return {
					value: branch.toLowerCase(),
					display: branch
				};
			});
		} else {
			return null;
		}
	}

	function createFilterFor(query) {
		var lowercaseQuery = angular.lowercase(query);
		return function filterFn(branch) {
			// console.log("Branch ID: "+JSON.stringify(branch));
			return (branch.value.indexOf(lowercaseQuery) === 0);
		};
	}


	// biller Query Search
	function billerQuerySearch(query) {
		var results = query ? $scope.billers.filter(billerCreateFilterFor(query)) : $scope.billers,
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

	function billerSearchTextChange(text) {
		console.log('Text changed to ' + text);
	}

	function billerSelectedItemChange(item) {
		console.log('Item changed to ' + item.value);
		$scope.selectedBiller = item.value;
	}

	function getBillers() {
		$scope.getAllBillers()
			.success(function(data, status, headers, config) {
				var res = data.payload;
				// console.log(JSON.stringify(res));
				for (var i in res) {
					allBillers += res[i].companyName + ",";
				}
				allBillers += "'";
				// console.log(allBillers);
				$scope.billers = loadAllBillers();
			})
			.error(function(data, status, headers, config) {
				$scope.handleError(data, status, headers, config);
			});
	}

	function loadAllBillers() {
		if (allBillers != "'") {
			return allBillers.split(/,+/g).map(function(biller) {
				// return allBranches.split(",").map(function(branch) {
				// console.log("Branch Is: "+branch);
				return {
					value: biller.toLowerCase(),
					display: biller
				};
			});
		} else {
			return null;
		}
	}

	function billerCreateFilterFor(query) {
		var lowercaseQuery = angular.lowercase(query);
		return function filterFn(biller) {
			// console.log("Biller: "+JSON.stringify(biller));
			return (biller.value.indexOf(lowercaseQuery) === 0);
		};
	}
};

module.exports = UserController;