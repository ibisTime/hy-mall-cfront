define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
    	// 分页查询活动
        getPageActivity(config, refresh) {
            return Ajax.get("808707", {
                status:'1',
                ...config
            }, refresh);
        },
        // 查询活动详情
        getActivityDetail(code) {
            return Ajax.get("808706", {
            	code
            });
        },
    	// 提交活动订单
        placeOrder(config) {
            return Ajax.get("808720", {
                applyUser: base.getUserId(),
                quantity:'1',
                ...config
            }, true);
        },
        // 我的订单分页查
        getPageOrders(config, refresh) {
            return Ajax.get("808735", {
                applyUser: base.getUserId(),
                ...config
            }, refresh);
        },
        // 取消订单
        cancelOrder(code) {
            return Ajax.get("808721", {
                userId: base.getUserId(),
                remark: "用户取消订单",
            	code
            }, true);
        },
        //批量支付订单
        payOrder(config, refresh) {
            return Ajax.get("808722", config, refresh);
        },
        // 获取订单详情
        getOrderDetail(code) {
            return Ajax.get("808736", {code});
        },
        // 获取活动订单运费
        getYunfei(config) {
            return Ajax.get("808723", {
            	applyUser: base.getUserId(),
            	quantity:'1',
            	...config
            }, true);
        },
        // 获取活动报名人数
        getActJoinIn(code) {
            return Ajax.get("808709", {code});
        },
    };
})
