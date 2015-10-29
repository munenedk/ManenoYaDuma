var TokenStorage = function(dumaSettings) {
  var storageKey = "auth_token";

  var isSessionActive = function(token) {
    var active = false;
    if (token !== null) {
      var user = JSON.parse(atob(token.split('.')[0]));
      var now = new Date().getTime();
      var currsession = now - user.loginTimeStamp;
      if (currsession < dumaSettings.session_timeout) {
        active = true;
      }
    }
    return active;
  };

  return {
    store: function(token) {
      return localStorage.setItem(storageKey, token);
    },
    retrieve: function() {
      return localStorage.getItem(storageKey);
    },
    clear: function() {
      return localStorage.removeItem(storageKey);
    },
    isSessionActive: function() {
      return isSessionActive;
    }
  };

};

module.exports = TokenStorage;