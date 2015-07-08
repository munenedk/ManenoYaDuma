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

	return {
		listCards: function() {
			return getCards;
		},
		save: function() {
			return saveCard;
		}
	};

};

module.exports = CardService;