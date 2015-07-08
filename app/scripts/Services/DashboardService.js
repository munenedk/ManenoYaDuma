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


	//Return Values
	return {
		topAmbassadors: function() {
			return getTopAmbassadors;
		},
		topRegions: function(){
			return getTopRegions;
		}
	};

};

module.exports = DashboardService;