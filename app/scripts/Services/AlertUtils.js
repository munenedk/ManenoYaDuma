var AlertUtils = function($mdDialog, $mdToast, $location, TokenStorage) {

	var redirectMsg = "Your Session has exprired. You have been redirected to the login page.";

	//Toast Position
	var toastPosition = {
		bottom: false,
		top: true,
		left: false,
		right: true
	};

	//Get Toast
	var getToastPosition = function() {
		return Object.keys(toastPosition)
			.filter(function(pos) {
				return toastPosition[pos];
			})
			.join(' ');
	};

	//Show Toast
	var showToast = function(message) {
		$mdToast.show(
			$mdToast.simple()
			.content(message)
			.position(getToastPosition())
			.hideDelay(5000)
		);
	};

	//Alerts
	var alert = "";
	var showAlert = function(status, message) {
		$mdDialog.show(
			$mdDialog.alert()
			.title("Error " + status)
			.content(message)
			.ariaLabel('Error Notification')
			.ok('Ok')
			// .targetEvent(ev)
		);
	};

	var isSessionActive = function() {
		TokenStorage.isSessionActive(TokenStorage.retrieve());
	};

	//Error Handling
	var handleError = function(data, status, headers, config) {
		var msg = data === null ? "Message Unavailable" : data.message;
		if (status === 401) { //unauthorized
			showAlert(status, msg + redirectMsg);
			$location.path('/login');
		} else if (status === 403) { //forbidden
			if (isSessionActive === true) {
				showAlert(status, msg + ". You Are Not Authorized To Use This Resource.");
			} else {
				showToast(redirectMsg);
				TokenStorage.clear();
				$location.path('/login');
			}
		} else {
			showAlert(status, msg);
		}
	};


	return {
		showToast: function() {
			return showToast;
		},
		showAlert: function() {
			return showAlert;
		},
		handleError: function() {
			return handleError;
		}
	};
};

module.exports = AlertUtils;