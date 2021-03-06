var BizNoService = function ($http, dumaSettings) {
    var apiUrl = dumaSettings.backendUrl + "paybill";

    //Get Business Numbers
    var getBusinessNumbers = function (params) {
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

    //Get All Business Numbers
    var getAllBusinessNumbers = function () {
        return $http({
            method: "GET",
            url: apiUrl + "/all",
            headers: {
                'Content-Type': 'application/json'
            }
        });
    };

    //Save Business Number
    var saveBiz = function (biz) {
        console.log(JSON.stringify(biz))
        return $http({
            method: "POST",
            url: apiUrl,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(biz)
        });
    };


    //Get Business Number
    var getBusinessNumber = function (bizId) {
        return $http({
            method: "GET",
            url: apiUrl + "/" + bizId,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    };

    //Update Business Number
    var updateBusinessNumber = function (biz) {
        console.log(JSON.stringify({
            method: "PUT",
            url: apiUrl,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(biz)
        }));
        return $http({
            method: "PUT",
            url: apiUrl,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(biz)
        });
    };

    //Approve Request
    var approveRequest = function (biz) {
        return $http({
            method: "PUT",
            url: apiUrl + "/approveRequest",
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
        listBusinessNumbers: function () {
            return getBusinessNumbers;
        },
        save: function () {
            return saveBiz;
        },
        listAllBizNos: function () {
            return getAllBusinessNumbers;
        },
        getBizNumber: function () {
            return getBusinessNumber;
        },
        updateBizNumber: function () {
            return updateBusinessNumber;
        },
        approveRequest: function () {
            return approveRequest;
        },
        rejectRequest: function () {
            return rejectRequest;
        }
    };
};

module.exports = BizNoService;