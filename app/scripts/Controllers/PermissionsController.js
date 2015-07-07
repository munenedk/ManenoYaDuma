/*jslint node: true */
/* global angular: false */

var PermissionsController = function($scope,$rootScope,$mdDialog,$mdToast,ngTableParams,PermissionsService){

	$rootScope.hamburgerAvailable = true;
	$rootScope.menuAvailable=true;

	//Inject Services To Scope
	$scope.getPermissions = PermissionsService.list();
	$scope.getPermission =  PermissionsService.find();
	$scope.savePermission = PermissionsService.save();


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

		//Save Role
		$scope.save = function save(permission){
			if($scope.permissionForm.$valid){
				$scope.savePermission(permission)
				.success(function(data,status,headers,config){
					$scope.showToast(data.message);
					$scope.resetForm();
				}).error(function(data,status,headers,config){
					$scope.showAlert(status,data.message);
				});
			}

		};

		//Reset Permissions Form
		$scope.resetForm = function(){
			$scope.permission = {
				permissionId:'',
				permissionName:'',
				permissionDescription:'',
			};
		};


		//Table
		$scope.tableParams = new ngTableParams({
	page: 1,			//Show first page
	count: 10,			//count per page
},{
	total:0,
	getData:function($defer,params){
		//ajax request to api
		$scope.getPermissions(params)
		.success(function(data,status,headers,config){
			var rData = {};
			rData = data.payload;
			// console.log(JSON.stringify(rData));

			var permissions = rData.content;

			params.total(rData.totalElements);
			//set New data
			$defer.resolve(permissions);
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

	};

	module.exports = PermissionsController;