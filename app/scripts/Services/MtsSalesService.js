var MtsSalesService = function($http, dumaSettings) {
	var apiUrl = dumaSettings.backendUrl + "mtsSales";
	//Get All Ambassador Uploads
	var getUploads = function(params) {
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

	//File Details
	var getFileDetails = function(params, uploadId) {
		return $http({
			method: "GET",
			url: apiUrl + "/" + uploadId,
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

	//Opened Accouonts
	var getOpenedAccounts = function(params, staffId, dateRange) {
		return $http({
			method: "GET",
			url: apiUrl + "/" + "accounts",
			headers: {
				'Content-Type': 'application/json'
			},
			params: {
				"page": params.page() - 1,
				"size": params.count(),
				"staffId": staffId,
				"dateRange": dateRange
			}
		});
	};


	//Download Reversal File
	var getFile = function(staffId,dateRange) {
		return $http({
			method: "GET",
			url: apiUrl + "/accounts/download/",
			// headers: {
			// 	'Content-Type': 'application/json',
			// 	'Accept':'application/vnd.ms-excel'
			// },
			params: {
				"staffId": staffId,
				"dateRange": dateRange
			},
			responseType: "arraybuffer"
		});
	};

	//Return Values
	return {
		listUploads: function() {
			return getUploads;
		},
		fileDetails: function() {
			return getFileDetails;
		},
		openedAccounts: function() {
			return getOpenedAccounts;
		},
		downloadFile: function() {
			return getFile;
		},
		staffUploads: function() {
			return getStaffUploads;
		}
	};
};

module.exports = MtsSalesService;