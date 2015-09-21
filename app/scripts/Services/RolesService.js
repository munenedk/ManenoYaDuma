var RolesService =  function($http,dumaSettings){

	var apiUrl = dumaSettings.backendUrl+"roles";

	//Get All Roles
	var getRoles = function(params){
		// console.log(JSON.stringify(params));
		console.log("Page: "+params.page());
		return $http({
			method:"GET",
			url:apiUrl,
			headers:{'Content-Type':'application/json'},
			params: {"page":params.page()-1,"size":params.count(),"filter":params.filter()}
		});
	};
	
	//get One role
	var getRole = function(id){
		return $http({
			method:"GET",
			url:apiUrl+"/"+id,
			headers:{'Content-Type':'application/json'}
		});
	};

	//Save role
	var save = function(rolesContext){
		return $http({
			method:"POST",
			url:apiUrl,
			headers:{'Content-Type':'application/json'},
			data:JSON.stringify(rolesContext)
		});
	};


	//Return Values
	return{
		list:function(){
			return getRoles;
		},

		find:function(){
			return getRole;
		},

		save:function(){
			return save;
		}
	};

};

module.exports =  RolesService;