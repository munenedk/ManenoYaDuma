var MtnPaymentsService = function($http, dumaSettings) {
	var apiUrl = dumaSettings.backendUrl + "mtn";


	//Get Payments - paginated
	var getPayments = function(params) {
		return $http({
			method: "GET",
			url: apiUrl,
			headers: {
				'Content-Type': 'application/json'
			},
			params: {
				"page": params.page() - 1,
				"size": params.count(),
				"filter": params.filter()
			}
		});
	};


	return {
		getPayments: function() {
			return getPayments;
		}
	};

};

module.exports = MtnPaymentsService;