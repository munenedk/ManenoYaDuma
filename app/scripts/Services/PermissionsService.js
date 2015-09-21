var PermissionsService =  function($http,dumaSettings){

	var apiUrl = dumaSettings.backendUrl+"permissions";

	//Get All Permissions
	var getPermissions = function(params){
		// console.log(JSON.stringify(params));
		console.log("Page: "+params.page());
		return $http({
			method:"GET",
			url:apiUrl,
			headers:{'Content-Type':'application/json'},
			params: {"page":params.page()-1,"size":params.count(),"filter":params.filter()}
		});

	};
	
	//get One permission
	var getPermission = function(id){
		return $http({
			method:"GET",
			url:apiUrl+"/"+id,
			headers:{'Content-Type':'application/json'}
		});
	};

	//Save permission
	var save = function(permission){
		return $http({
			method:"POST",
			url:apiUrl,
			headers:{'Content-Type':'application/json'},
			data:JSON.stringify(permission)
		});
	};


	//Return Values
	return{
		list:function(){
			return getPermissions;
		},

		find:function(){
			return getPermission;
		},

		save:function(){
			return save;
		}
	};

};

module.exports = PermissionsService;