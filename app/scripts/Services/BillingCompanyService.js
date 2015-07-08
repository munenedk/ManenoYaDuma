var BillingCompanyService = function($http,dumaSettings){
var apiUrl = dumaSettings.backendUrl + "companies";

//Get Companies - paginated
	var getBillingCompanies = function(params) {
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

	//Save Billing Company
	var saveBillingCompany = function(company) {
		return $http({
			method: "POST",
			url: apiUrl,
			headers: {
				'Content-Type': 'application/json',
			},
			data: JSON.stringify(company)
		});
	};

	return {
		listCompanies: function() {
			return getBillingCompanies;
		},
		save: function() {
			return saveBillingCompany;
		}
	};
};

module.exports = BillingCompanyService;