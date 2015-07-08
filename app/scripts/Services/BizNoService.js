var BizNoService = function($http, dumaSettings) {
	var apiUrl = dumaSettings.backendUrl + "paybill";

	//Get Business Numbers
	var getBusinessNumbers = function(params) {
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

	//Get All Business Numbers
	var getAllBusinessNumbers = function() {
		return $http({
			method: "GET",
			url: apiUrl+"/all",
			headers: {
				'Content-Type': 'application/json'
			}
		});
	};

	//Save Business Number
	var saveBiz = function(biz) {
		return $http({
			method: "POST",
			url: apiUrl,
			headers: {
				'Content-Type': 'application/json',
			},
			data: JSON.stringify(biz)
		});
	};

	return {
		listBusinessNumbers: function() {
			return getBusinessNumbers;
		},
		save: function() {
			return saveBiz;
		},
		listAllBizNos:function(){
			return getAllBusinessNumbers;
		}
	};
};

module.exports = BizNoService;