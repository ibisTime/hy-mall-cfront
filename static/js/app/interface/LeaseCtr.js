define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        // 列表查询类型
        getListCategory(refresh) {
            return Ajax.get("808007", {
                status:'1',
            	type: '4',
		        orderColumn:'order_no',
		        orderDir:'asc'
            }, refresh);
        },
        // 分页获取商品
        getPageLeaseProduct(config, refresh) {
            return Ajax.get("810025", {
                status:'3',
                companyCode: SYSTEM_CODE,
            	userId: base.getUserId(),
                ...config
            }, refresh);
        },
        // 详情查询商品
        getLeaseProductDetail(code) {
            return Ajax.get("810026", {
            	code,
            	userId: base.getUserId()
            }, true);
        },
        //提交订单
        placeOrder(config) {
            return Ajax.get("810040", config, true);
        },
        //批量支付订单
        payOrder(config, refresh) {
            return Ajax.get("810043", config, refresh);
        },
        // 获取订单详情
        getOrderDetail(code) {
            return Ajax.get("810056", {code});
        },
        // 我的订单分页查
        getPageOrders(config, refresh) {
            return Ajax.get("810058", {
                applyUser: base.getUserId(),
                ...config
            }, refresh);
        },
        // 取消订单
        cancelOrder(code) {
            return Ajax.get("810042", {
                userId: base.getUserId(),
            	code
            }, true);
        },
        // 确认收货
        confirmOrder(code) {
            return Ajax.get("810048", {
                updater: base.getUserId(),
            	code,
            	remark:'用户确认收货'
            }, true);
        },
        // 催单
        reminderOrder(code) {
            return Ajax.get("810044", {code}, true);
        },
        // 归还
        returnOrder(config) {
            return Ajax.get("810049", config, true);
        },
        // 评论订单
        commentOrder(config){
            return Ajax.get("810051", {
                commenter : base.getUserId(),
                ...config
            }, true);
        },
        // 减免说明
        getJmExplain(type){
            return Ajax.get("808918", {
                type: type
            }, true);
        },
        /**
         * 获取可减免金额
         * @param config: {productCode,quantity}
         */
        getLeaseProJmAmount(config){
            return Ajax.get("810060", {
                userId : base.getUserId(),
                ...config
            }, true);
        },
        //获取运费
        getYunfei(config){
            return Ajax.get("810061", config, true);
        },
        // 删除用户取消订单
        deleteOrder(code) {
            return Ajax.get("810052", {
                userId: base.getUserId(),
            	code
            }, true);
        },
        // 查询订单可积分抵扣金额
        getDKAmount(code) {
            return Ajax.get("810062", {code}, true);
        },
    };
})
