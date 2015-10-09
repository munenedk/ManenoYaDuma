var DashboardService = function($http, dumaSettings) {
	var apiUrl = dumaSettings.backendUrl + "dashboard";

	//Get Top Ambassadors
	var getTopAmbassadors = function() {
		return $http({
			method: "GET",
			url: apiUrl + "/topAmbassadors",
			headers: {
				'Content-Type': 'application/json'
			}
		});
	};

	//Get Top Regions
	var getTopRegions = function() {
		return $http({
			method: "GET",
			url: apiUrl + "/topRegions",
			headers: {
				'Content-Type': 'application/json'
			}
		});
	};

	//Get txStatus Summary
	var getTxStatus = function() {
		return $http({
			method: "GET",
			url: apiUrl + "/txStatus",
			headers: {
				'Content-Type': 'application/json'
			}
		});
	};

	//Get txTotal Summary
	var getTxTotals = function() {
		return $http({
			method: "GET",
			url: apiUrl + "/txTotals",
			headers: {
				'Content-Type': 'application/json'
			}
		});
	};


	//Return Values
	return {
		topAmbassadors: function() {
			return getTopAmbassadors;
		},
		topRegions: function() {
			return getTopRegions;
		},
		getTxStatus: function() {
			return getTxStatus;
		},
		getTxTotals: function() {
			return getTxTotals;
		}
	};

};

module.exports = DashboardService;