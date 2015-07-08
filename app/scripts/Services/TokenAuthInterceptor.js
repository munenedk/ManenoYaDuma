var TokenAuthInterceptor = function($q, TokenStorage) {
  return {
    request: function(config) {
      var authToken = TokenStorage.retrieve();
      if (authToken) {
        config.headers["X-AUTH-TOKEN"] = authToken;
      }
      return config;
    },
    responseError: function(error) {
      // console.log("Error: "+JSON.stringify(error));
      if (error.status === 401) { //unauthorized
        TokenStorage.clear(); //Remove Token
      }
      return $q.reject(error);
    }
  };

};

module.exports = TokenAuthInterceptor;