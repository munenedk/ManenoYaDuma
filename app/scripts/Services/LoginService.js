var LoginService = function($http,dumaSettings){

	var apiUrl = dumaSettings.backendUrl+"login";

	//Login
	var login = function(user){
		// console.log(apiUrl);
		// console.log(JSON.stringify(user));
		var credentials = JSON.stringify(user);
		return $http({
			method:"POST",
			url:apiUrl,
			headers:{'Content-Type':'text/plain;charset=UTF-8'},
			// data:{"email":user.email,"password":user.password}
			data:JSON.stringify(user)
		});
	};


		//Return Values
		return{
			login:function(){
				return login;
			}
		};
	};

	module.exports = LoginService;