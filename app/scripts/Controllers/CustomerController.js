/*jslint node: true */
/* global angular: false */

var CustomerController = function($scope,$mdDialog,$mdToast,ngTableParams,CustomerService){

	//Inject Service methods to scope
	$scope.getCustomers = CustomerService.list();
	$scope.getCustomer =  CustomerService.find();

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


	//Table
	$scope.tableParams = new ngTableParams({
	page: 1,			//Show first page
	count: 10,			//count per page
},{
	total:0,
	getData:function($defer,params){
		//ajax request to api
		$scope.getCustomers(params)
		.success(function(data,status,headers,config){
			var rData = {};
			rData = data.payload;
			// console.log(JSON.stringify(rData));

			var customers = rData.content;
			// console.log(customers);

			params.total(rData.totalElements);
			//set New data
			$defer.resolve(customers);
		})
		.error(function(data,status,headers,config){
			alert("Error! "+status);
		});
	}
});



};





module.exports = CustomerController;