var PaymentsService = function($http, dumaSettings) {
	var apiUrl = dumaSettings.backendUrl + "payments";

	var getPayment = function(paymentId) {
		return $http({
			method: "GET",
			url: apiUrl + "/" + paymentId,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	};

	//Get Payments
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

	//Update Payment
	var updatePayment = function(payment) {
		return $http({
			method: "PUT",
			url: apiUrl + "/updateRequest",
			headers: {
				'Content-Type': 'application/json'
			},
			data: JSON.stringify(payment)
		});
	};

	//Get Adjustments
	var getPaymentAdjustments = function(params) {
		return $http({
			method: "GET",
			url: apiUrl + "/adjustments",
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

	//Approve Requests
	var approveRequest = function(txLog) {
		return $http({
			method: "PUT",
			url: apiUrl + "/approveRequest",
			headers: {
				'Content-Type': 'application/json'
			},
			data: JSON.stringify(txLog)
		});
	};

	//Reject Request
	var rejectRequest = function(txLog) {
		return $http({
			method: "PUT",
			url: apiUrl + "/rejectRequest",
			headers: {
				'Content-Type': 'application/json'
			},
			data: JSON.stringify(txLog)
		});
	};

	return {
		getPaymentById: function() {
			return getPayment;
		},
		getPayments: function() {
			return getPayments;
		},
		updatePayment: function() {
			return updatePayment;
		},
		getAdjustments: function() {
			return getPaymentAdjustments;
		},
		approveRequest: function() {
			return approveRequest;
		},
		rejectRequest:function(){
			return rejectRequest;
		}
	};

};

module.exports = PaymentsService;