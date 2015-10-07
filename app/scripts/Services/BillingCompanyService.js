var BillingCompanyService = function($http, dumaSettings) {
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
		console.log("Service ACCNO: "+accNo);
		return $http({
			method: "GET",
			url: apiUrl + "/validateAccount/"+accNo,
			headers: {
				'Content-Type': 'application/json',
			}
		});
	};

	return {
		listCompanies: function() {
			return getBillingCompanies;
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