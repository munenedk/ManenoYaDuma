var PasswordChangeService = function($http, dumaSettings) {

	var apiUrl = dumaSettings.backendUrl + "users";

	//Password Change
	var submitPasswordChange = function(user) {
		var credentials = JSON.stringify(user);
		return $http({
			method: "PUT",
			url: apiUrl + "/changePassword",
			headers: {
				'Content-Type': 'application/json'
			},
			data: JSON.stringify(user)
		});
	};

	var passwordReset = function(email) {
		// console.log("Password Reset Email: "+email);
		return $http({
			method: "PUT",
			url: apiUrl + "/resetPassword/" + email,
			headers: {
				'Content-Type': 'application/json'
			},
		});

	};


	//Return Values
	return {
		changePassword: function() {
			return submitPasswordChange;
		},
		resetPassword: function() {
			return passwordReset;
		}
	};

};

module.exports = PasswordChangeService;