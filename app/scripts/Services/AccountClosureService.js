/**
 * Created by munenedk-pc on 13-Jul-16.
 */
var AccountClosureService = function ($http, dumaSettings) {
    
    var endpoint = dumaSettings.backendUrl + "recycle";

    //Get Account Closure details
    var getClosureDetails = function(params){
        return $http({
            method: "GET",
            url: endpoint,
            headers:{'Content-Type': 'application/json'},
            params: {
                "page": params.page() - 1,
                "size": params.count(),
                "filter": params.filter()
            }
        });
    };

    //Save Account Number
    var saveAccount = function (account) {
        return $http({
            method: "POST",
            url: dumaSettings.backendUrl + "customers/save",
            headers: {'Content-Type': 'application/json'},
            data: JSON.stringify(account)
        });
    };
    
    //Search account number
    var searchMsidn = function (msidn) {
        return $http({
            method: "GET",
            url: endpoint+"/search?msidn="+msidn,
            headers: {'Content-Type': 'application/json'}
        });
    };
    
     //Approve Closures
    var submitClosures = function (list) {
        return $http({
            method: "POST",
            url: endpoint + "/approve",
            headers: {'Content-Type': 'application/json'},
            data: JSON.stringify(list)
        });
    }; 
    
    //Reject Cosures
    var submitRejections = function (list) {
        return $http({
            method: "POST",
            url: endpoint + "/reject",
            headers: {'Content-Type': 'application/json'},
            data: JSON.stringify(list)
        });
    };
    
    //Approve Bulk Closures
    var submitBulkClosures = function (dataArray) {
        return $http({
            method: "POST",
            url: endpoint + "/bulk",
            headers: {'Content-Type': 'application/json'},
            data: JSON.stringify(dataArray)
        });
    };

    return {
        listClosureDetails: function () {
            return getClosureDetails;
        },
        save : function(){
            return saveAccount;
        },
        getMisdn: function(){
            return searchMsidn;
        },
        sendClosureList : function (){
            return submitClosures;
        },
        sendRejectionList : function(){
            return submitRejections;
        },
        sendBulkList : function (){
            return submitBulkClosures;
        }
    };


};

module.exports = AccountClosureService;
