/*jslint node: true */
/* global angular: false */


var UserController = function($scope,$rootScope,$mdDialog,$mdToast,ngTableParams,UserService,RolesService,$routeParams){

//Show Menu Buttons
$rootScope.hamburgerAvailable = true;
$rootScope.menuAvailable=true;

//Manage Tabs
$scope.selectedTab = 0;
$scope.userDetailsTabDisabled = false;
$scope.userRolesTabDisabled = true;

//save progress
$scope.showSaveProgress = false;

//form
$scope.form = {};

//Selected Roles
$scope.selectedRoles = [];


//Inject Service methods to scope
$scope.getUsers = UserService.list();
$scope.getUser =  UserService.find();
$scope.saveUser = UserService.save();
$scope.getRoles = RolesService.list();

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

	$scope.setUser = function(user){
		if($scope.form.userForm.$valid){
			$scope.user = user;
			$scope.userDetailsTabDisabled = true;
			$scope.userRolesTabDisabled = false;
			$scope.selectedTab = 1;
		}
	};


	//Save user
	$scope.save = function(){
		var userContext = {
			'user':$scope.user,
			'roles':$scope.selectedRoles
		};
		//Show Progress
		$scope.showSaveProgress = true;
		$scope.saveUser(userContext)
		.success(function(data,status,headers,config){
			$scope.showSaveProgress = false;
			$scope.showToast(data.message);
			$scope.resetForm();
		}).error(function(data,status,headers,config){
			$scope.showSaveProgress = false;
			$scope.showAlert(status,data.message);
		});
	};

	//Reset User Form
	$scope.resetForm = function(){
		$scope.user = {
			userId:'',
			name:'',
			email:'',
			dateCreated:'',
			lastPasswordChange:'',
			status:''
		};
	};

	//User Table
	$scope.tableParams = new ngTableParams({
	page: 1,			//Show first page
	count: 10,			//count per page
},{
	total:0,
	getData:function($defer,params){
		//ajax request to api
		$scope.getUsers(params)
		.success(function(data,status,headers,config){
			var rData = {};
			rData = data.payload;
			// console.log(JSON.stringify(rData));

			var users = rData.content;

			params.total(rData.totalElements);
			//set New data
			$defer.resolve(users);
		})
		.error(function(data,status,headers,config){
			var msg = "N/A";
			if(data !== null){
				msg = data.error+" : "+data.message;
			}
			$scope.showAlert(status,msg);
			// alert("Error! "+status);
		});
	}
});

		//Roles Table
		$scope.roleTableParams = new ngTableParams({
	page: 1,			//Show first page
	count: 10,			//count per page
},{
	total:0,
	getData:function($defer,params){
		//ajax request to api
		$scope.getRoles(params)
		.success(function(data,status,headers,config){
			var rData = {};
			rData = data.payload;

			var users = rData.content;

			params.total(rData.totalElements);
			//set New data
			$defer.resolve(users);
		})
		.error(function(data,status,headers,config){
			var msg = "N/A";
			if(data !== null){
				msg = data.error+" : "+data.message;
			}
			$scope.showAlert(status,msg);
		});
	}
});

		$scope.toggleSelectedRole = function(role){
			var idx = $scope.selectedRoles.indexOf(role);

			//is Currently selected
			if(idx > -1){
				$scope.selectedRoles.splice(idx,1);
			}

			//is newly selected
			else{
				$scope.selectedRoles.push(role);
			}
		};

		$scope.restart = function(){
			$scope.resetForm();
			$scope.selectedRole.length = 0;
			$scope.roleDetailsTabDisabled = false;
			$scope.userDetailsTabDisabled = true;
			$scope.selectedTab = 0;
		};


	};

	module.exports = UserController;