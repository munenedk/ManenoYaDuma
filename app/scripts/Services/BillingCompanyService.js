var BillingCompanyService = function($http, dumaSettings) {
	var apiUrl = dumaSettings.backendUrl + "companies";
	var apiUrl1 = dumaSettings.backendUrl + "tarrifs";

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

	//Get all billing companies
	var getAllBillingCompanies = function() {
		return $http({
			method: "GET",
			url: apiUrl + "/all",
			headers: {
				'Content-Type': 'application/json'
			}
		});
	};

	//Save Billing Company
	var saveBillingCompany = function(company,bizTypes) {
		
		console.log(company);
		return $http({
			method: "POST",
			url: apiUrl,
			headers: {
				'Content-Type': 'application/json',
			},
			params: {
				"biztype": bizTypes
				
			},
			data: JSON.stringify(company)
		});

	};


	//Get Billing Company
	var getBillingCompany = function(companyId) {
		return $http({
			method: "GET",
			url: apiUrl + "/" + companyId,
			headers: {
				'Content-Type': 'application/json',
			}
		});
	};

	//Save Billing Company
	var updateBillingCompany = function(company) {
		return $http({
			method: "PUT",
			url: apiUrl,
			headers: {
				'Content-Type': 'application/json',
			},
			data: JSON.stringify(company)
		});
	};


	var getTarrif = function() {

		return $http({
			method: "GET",
			url: apiUrl1,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	};



	//Approve Request
	var approveRequest = function(company) {
		return $http({
			method: "PUT",
			url: apiUrl + "/approveRequest",
			headers: {
				'Content-Type': 'application/json',
			},
			data: JSON.stringify(company)
		});
	};

	//Reject Request
	var rejectRequest = function(company) {
		return $http({
			method: "PUT",
			url: apiUrl + "/rejectRequest",
			headers: {
				'Content-Type': 'application/json',
			},
			data: JSON.stringify(company)
		});
	};

	var validateAccountNumber = function(accNo) {
		console.log("Service ACCNO: " + accNo);
		return $http({
			method: "GET",
			url: apiUrl + "/validateAccount/" + accNo,
				headers: {
				'Content-Type': 'application/json',
			}
		});
	};

	return {
		listCompanies: function() {
			return getBillingCompanies;
		},
		getAllBillingCompanies: function() {
			return getAllBillingCompanies;
		},
		save: function() {
			return saveBillingCompany;
		},
		getCompany: function() {
			return getBillingCompany;
		},
		updateCompany: function() {
			return updateBillingCompany;
		},
		getTarrif: function() {
			return getTarrif;
		},
		approveRequest: function() {
			return approveRequest;
		},
		rejectRequest: function() {
			return rejectRequest;
		},
		validateAccountNumber: function() {
			return validateAccountNumber;
		}
	};
};

module.exports = BillingCompanyService;