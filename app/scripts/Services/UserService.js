var UserService = function($http, dumaSettings) {

	var apiUrl = dumaSettings.backendUrl + "users";

	//Get All Users
	var getUsers = function(params) {
		// console.log(JSON.stringify(params));
		console.log("Page: " + params.page());
		return $http({
			method: "GET",
			url: apiUrl,
			headers: {
				'Content-Type': 'application/json',
			},
			params: {
				"page": params.page() - 1,
				"size": params.count(),
				"filter": params.filter()
			}
		});

	};

	//get One User
	var getUser = function(id) {
		return $http({
			method: "GET",
			url: apiUrl + "/" + id,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	};

	//Save user
	var save = function(userContext) {
		console.log(userContext);
		return $http({
			method: "POST",
			url: apiUrl,
			headers: {
				'Content-Type': 'application/json'
			},
			data: JSON.stringify(userContext)
		});
	};

	//Get All Branches
	var getAllBranches = function() {
		return $http({
			method: "GET",
			url: apiUrl + "/branches",
			headers: {
				'Content-Type': 'application/json'
			}
		});
	};


	//Return Values
	return {
		list: function() {
			return getUsers;
		},

		find: function() {
			return getUser;
		},
		save: function() {
			return save;
		},
		listAllBranches: function() {
			return getAllBranches;
		}
	};


};

module.exports = UserService;