var PaybillReportsService = function($http, dumaSettings) {
	var apiUrl = dumaSettings.backendUrl + "paybillReports";

	var getBusinessNumbers = function() {
		return $http({
			method: "GET",
			url: apiUrl,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	};

	//Download Html File
	var getReport = function(searchParams) {
		return $http({
			method: "POST",
			url: apiUrl + "/html",
			headers: {
				'Content-Type': 'application/json'
			},
			data: JSON.stringify(searchParams)
		});
	};

	// Download Pdf/xls File
	var downloadReport = function(searchParams) {
		return $http({
			method: "POST",
			url: apiUrl,
			responseType: "arraybuffer",
			data: JSON.stringify(searchParams)
		});
	};

	return {
		getBizNos: function() {
			return getBusinessNumbers;
		},
		getReport: function() {
			return getReport;
		},
		downloadReport: function() {
			return downloadReport;
		}
	};

};

module.exports = PaybillReportsService;