var TokenStorage = function() {
  var storageKey = "auth_token";

  return {
    store: function(token) {
      return localStorage.setItem(storageKey, token);
    },
    retrieve: function() {
      return localStorage.getItem(storageKey);
    },
    clear: function() {
      return localStorage.removeItem(storageKey);
    }
  };

};

module.exports = TokenStorage;