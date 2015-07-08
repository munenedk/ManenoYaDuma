var CustomerService = function($http,dumaSettings){
	var apiUrl = dumaSettings.backendUrl+"customers";

	//Get All Customers
	var getCustomers = function(params){
		// console.log(JSON.stringify(params));
		console.log("Page: "+params.page());
		return $http({
			method:"GET",
			url:apiUrl,
			headers:{'Content-Type':'application/json'},
			params: {"page":params.page()-1,"size":params.count(),"filter":params.filter()}
		});
	};
	
	//get One customer
	var getCustomer = function(id){
		return $http({
			method:"GET",
			url:apiUrl+"/"+id,
			headers:{'Content-Type':'application/json'}
		});
	};


	//Return Values
	return{
		list:function(){
			return getCustomers;
		},

		find:function(){
			return getCustomer;
		}
	};

};


module.exports = CustomerService;