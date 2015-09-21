var LoginService = function($http, dumaSettings, $rootScope) {

	var apiUrl = dumaSettings.backendUrl + "login";

	//Login
	var login = function(user) {
		var credentials = JSON.stringify(user);
		return $http({
			method: "POST",
			url: apiUrl,
			headers: {
				// 'Content-Type': 'text/plain;charset=UTF-8'
				'Content-Type': 'application/json'
			},
			data: JSON.stringify(user)
		});
	};

	//Menu Change
	var getUserMenu = function() {
		$rootScope.$broadcast('changeMenu');
	};


	//Return Values
	return {
		login: function() {
			return login;
		},
		loadMenu: function() {
			return getUserMenu;
		}
	};
};

module.exports = LoginService;