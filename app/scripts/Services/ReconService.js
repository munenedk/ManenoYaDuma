var ReconService = function($http, dumaSettings) {

  var apiUrl = dumaSettings.backendUrl + "mpesaRecon";

  //Get All Uploads
  var getUploads = function(params, reconType) {
    console.log("Page: " + params.page());
    return $http({
      method: "GET",
      url: apiUrl + "/uploads/" + reconType,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        "page": params.page() - 1,
        "size": params.count()
      }
    });
  };

  //Get Recons - paginated
  var getRecons = function(params, uploadId, reconType) {
    console.log("Page: " + params.page());
    return $http({
      method: "GET",
      url: apiUrl + "/recons/" + reconType + "/" + uploadId,
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

  //Recon Request From Maker
  var makeReconRequest = function(uploadId, recons, reconType) {
    return $http({
      method: "POST",
      url: apiUrl + "/recons/" + reconType.toLowerCase() + "/" + uploadId,
      headers: {
        'Content-Type': 'application/json'
      },
      // data: JSON.stringify(recons)
      data: recons
    });
  };

  //Get All Recons
  var getAllRecons = function(uploadId, reconType) {
    return $http({
      method: "GET",
      url: apiUrl + "/recons/all/" + uploadId + "/" + reconType,
      headers: {
        'Content-Type': 'application/json'
      },
    });
  };

  var getReconRequests = function(params, requestUploadId, reconType) {
    return $http({
      method: "GET",
      url: apiUrl + "/recons/requests/" + requestUploadId + "/" + reconType,
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

  //Get All Requests
  var getAllRequests = function(requestUploadId) {
    return $http({
      method: "GET",
      url: apiUrl + "/recons/allRequests/" + requestUploadId,
      headers: {
        'Content-Type': 'application/json'
      },
    });
  };

  //Approve the request
  var submitRequests = function(requests, reconType) {
    return $http({
      method: "POST",
      url: apiUrl + "/recons/approve/" + reconType,
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(requests)
    });
  };

  //Get Approved requests statuses
  var getReversalStatus = function(params, uploadId, reconType) {
    console.log("Getting reversals");
    return $http({
      method: "GET",
      url: apiUrl + "/reversalStatus/" + reconType + "/" + uploadId,
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

  //Download Reversal File
  var getFile = function(reconType, uploadId) {
    return $http({
      method: "GET",
      url: apiUrl + "/reversalStatus/download/" + reconType + "/" + uploadId,
      // headers: {
      //   'Content-Type': 'application/vnd.ms-excel'
      // },
      responseType: "arraybuffer"
    });
  };

  return {
    list: function() {
      return getUploads;
    },
    listRecons: function() {
      return getRecons;
    },
    listAllRecons: function() {
      return getAllRecons;
    },
    submitReconRequest: function() {
      return makeReconRequest;
    },
    listReconRequests: function() {
      return getReconRequests;
    },
    listAllRequests: function() {
      return getAllRequests;
    },
    approveRequests: function() {
      return submitRequests;
    },
    listReversalStatus: function() {
      return getReversalStatus;
    },
    downloadFile: function() {
      return getFile;
    }
  };

};

module.exports = ReconService;