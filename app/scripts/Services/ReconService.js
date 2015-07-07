var ReconService =  function($http,dumaSettings){

	var apiUrl = dumaSettings.backendUrl+"mpesaRecon";

	//Get All Uploads
	var getUploads = function(params){
		console.log("Page: "+params.page());
		return $http({
			method:"GET",
			url:apiUrl+"/uploads",
			headers:{'Content-Type':'application/json'},
			params: {"page":params.page()-1,"size":params.count()}
		});
	};

  //Get Recons - paginated
  var getRecons = function(params,uploadId){
    console.log("Page: "+params.page());
    return $http({
      method:"GET",
      url:apiUrl+"/recons/"+uploadId,
      headers:{'Content-Type':'application/json'},
      params: {"page":params.page()-1,"size":params.count(),"filter":params.filter()}
    });
  };

  //Recon Request From Maker
  var makeReconRequest = function(uploadId,recons){
    return $http({
      method:"POST",
      url:apiUrl+"/recons/"+uploadId,
      headers:{'Content-Type':'application/json'},
      data:JSON.stringify(recons)
    });
  };

    //Get All Recons
    var getAllRecons = function(uploadId){
      return $http({
        method:"GET",
        url:apiUrl+"/recons/all/"+uploadId,
        headers:{'Content-Type':'application/json'},
      });
    };

    var getReconRequests =  function(params,requestUploadId){
      return $http({
        method:"GET",
        url:apiUrl+"/recons/requests/"+requestUploadId,
        headers:{'Content-Type':'application/json'},
        params: {"page":params.page()-1,"size":params.count(),"filter":params.filter()}
      });
    };

     //Get All Requests
     var getAllRequests = function(requestUploadId){
      return $http({
        method:"GET",
        url:apiUrl+"/recons/allRequests/"+requestUploadId,
        headers:{'Content-Type':'application/json'},
      });
    };

    //Approve the request
    var approveRequests = function(requestUploadId,requests){
      return $http({
        method:"POST",
        url:apiUrl+"/recons/approve"+requestUploadId,
        headers:{'Content-Type':'application/json'},
        data:JSON.stringify(requests)
      });
    };

    return{
      list:function(){
       return getUploads;
     },
     listRecons:function(){
      return getRecons;
    },
    listAllRecons:function(){
      return getAllRecons;
    },
    submitReconRequest:function(){
      return makeReconRequest;
    },
    listReconRequests:function(){
      return getReconRequests;
    },
    listAllRequests:function(){
      return getAllRequests;
    },
    approveRequests : function(){
      return submitRequests;
    }
  };

};

module.exports = ReconService;