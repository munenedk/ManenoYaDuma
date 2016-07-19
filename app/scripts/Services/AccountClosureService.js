/**
 * Created by munenedk-pc on 13-Jul-16.
 */
var AccountClosureService = function ($http, dumaSettings) {
    var apiUrl = dumaSettings.backendUrl + "paybill";
//---------------------------Dan Stuff-----------------------------------------------------
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
    var submitClosures = function (numberList) {
        return $http({
            method: "POST",
            url: endpoint + "/approve",
            headers: {'Content-Type': 'application/json'},
            data: JSON.stringify(numberList)
        });
    };   

//---------------------------End of Dan Stuff---------------------------------------------------

    //Update Business Number
    var updateBusinessNumber = function (biz) {
        return $http({
            method: "PUT",
            url: apiUrl,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(biz)
        });
    };

    //Reject Request
    var rejectRequest = function (biz) {
        return $http({
            method: "PUT",
            url: apiUrl + "/rejectRequest",
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(biz)
        });
    };


    return {
        updateBizNumber: function () {
            return updateBusinessNumber;
        },
        rejectRequest: function () {
            return rejectRequest;
        }, //Below are Dan additions
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
        }
    };


};

module.exports = AccountClosureService;
