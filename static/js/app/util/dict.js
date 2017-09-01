define([
    'app/controller/base',
    'app/util/ajax'
], function(base, ajax) {
    var dict = {
        // 活动订单状态
        mallOrderStatus: {
            "1": "待支付",
            "2": "待发货",
            "3": "待收货",
            "4": "待评价",
            "91": "用户取消",
            "92": "平台取消",
            "93": "快递异常",
        }
    };

    var changeToObj = function(data) {
        var data = data || [],
            obj = {};
        data.forEach(function(item) {
            obj[item.dkey] = item.dvalue;
        });
        return obj;
    };

    return {
        get: function(code) {
            return dict[code];
        }
    }
});
