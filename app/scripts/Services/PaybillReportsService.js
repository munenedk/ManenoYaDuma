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
		var mUrl = apiUrl;
		if (searchParams.format == 'pdf') {
			mUrl = mUrl + "/pdf";
		} else {
			mUrl = mUrl + "/xls";
		}

		return $http({
			method: "POST",
			url: mUrl,
			responseType: "arraybuffer",
			data: JSON.stringify(searchParams)
		});
	};

	// Lipa Karo Report
	var getLipaKaroReport = function(searchParams) {
		// console.log(JSON.stringify(searchParams));
		return $http({
			method: "POST",
			url: apiUrl + "/lipakaro",
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
		},
		getLipaKaroReport: function() {
			return getLipaKaroReport;
		}
	};

};

module.exports = PaybillReportsService;