define([
    'app/controller/base',
    'app/util/ajax'
], function(base, ajax) {
    var dict = {
        // 团课状态
        courseStatus: {
            "0": "已下架",
            "1": "报名中",
            "2": "截止报名",
            "3": "已下架",
            "4": "截止报名",
            "5": "截止报名"
        },
        // 团课订单状态
        courseOrderStatus: {
            "0": "待付款",
            "1": "付款成功",
            "2": "用户取消订单",
            "3": "平台取消订单",
            "4": "退款申请",
            "5": "退款成功",
            "6": "退款失败",
            "7": "已上课",
            "8": "待评价",
            "9": "已完成"
        },
        // 私课订单状态
        coachOrderStatus: {
            "0": "待付款",
            "1": "付款成功",
            "2": "已接单",
            "3": "已上课",
            "4": "待评价",
            "5": "用户取消",
            "6": "私教取消",
            "7": "已完成"
        },
        // 活动状态
        activityStatus: {
            "0": "已下架",
            "1": "报名中",
            "2": "截止报名",
            "3": "已下架",
            "4": "截止报名",
            "5": "截止报名"
        },
        // 活动订单状态
        activityOrderStatus: {
            "0": "待付款",
            "1": "付款成功",
            "2": "用户取消订单",
            "3": "平台取消订单",
            "4": "退款申请",
            "5": "退款成功",
            "6": "退款失败",
            "7": "活动开始",
            "8": "已完成"
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
