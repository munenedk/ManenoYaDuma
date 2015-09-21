var CardService = function($http, dumaSettings) {
	var apiUrl = dumaSettings.backendUrl + "cards";

	//Get Cards
	var getCards = function(params) {
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

	//Get Card
	var getCard = function(cardId) {
		return $http({
			method: "GET",
			url: apiUrl + "/" + cardId,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	};

	//Save Card
	var saveCard = function(card) {
		return $http({
			method: "POST",
			url: apiUrl,
			headers: {
				'Content-Type': 'application/json',
			},
			data: JSON.stringify(card)
		});
	};

	//update Card
	var updateCard = function(card) {
		return $http({
			method: "PUT",
			url: apiUrl,
			headers: {
				'Content-Type': 'application/json',
			},
			data: JSON.stringify(card)
		});
	};

	//Approve Request
	var approveRequest = function(card) {
		return $http({
			method: "PUT",
			url: apiUrl + "/approveRequest",
			headers: {
				'Content-Type': 'application/json',
			},
			data: JSON.stringify(card)
		});
	};

	//Reject Request
	var rejectRequest = function(card) {
		return $http({
			method: "PUT",
			url: apiUrl + "/rejectRequest",
			headers: {
				'Content-Type': 'application/json',
			},
			data: JSON.stringify(card)
		});
	};

	return {
		listCards: function() {
			return getCards;
		},
		save: function() {
			return saveCard;
		},
		getCard: function() {
			return getCard;
		},
		updateCard: function() {
			return updateCard;
		},
		approveRequest: function() {
			return approveRequest;
		},
		rejectRequest: function() {
			return rejectRequest;
		}
	};

};

module.exports = CardService;