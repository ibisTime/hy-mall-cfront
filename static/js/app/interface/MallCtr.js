define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        // 获取商品大类列表
        getBigCategoryList(refresh) {
            return Ajax.get("808007", {
                parentCode: "0",
                status: "1",
                orderColumn: "order_no",
                orderDir: "asc",
                type: "1"
            }, refresh);
        },
        // 获取商品大类列表
        getBigCategoryPage(refresh) {
            return Ajax.get("808005", {
                parentCode: "0",
			    start: 1,
			    limit: 12,
                status: "1",
                orderColumn: "order_no",
                orderDir: "asc",
                type: "1"
            }, refresh);
        },
        // 获取商品小类列表
        getSmallCategoryList(parentCode, refresh) {
            return Ajax.get("808007", {
                parentCode,
                status: "1",
                orderColumn: "order_no",
                orderDir: "asc",
                type: "1"
            }, refresh);
        },
        // 分页获取商品
        getPageProduct(config) {
            return Ajax.get("808025", {
                status:'3',
                companyCode: SYSTEM_CODE,
            	userId: base.getUserId(),
                ...config
            }, true);
        },
        // 详情查询商品
        getProductDetail(code) {
            return Ajax.get("808026", {
            	code,
            	userId: base.getUserId()
            }, true);
        },
        //加入购物车
        addShoppingCar(config, refresh) {
            return Ajax.get("808040", {
                userId: base.getUserId(),
                ...config
            }, refresh);
        },
        //立即下单
        placeOrder(config, refresh) {
            return Ajax.get("808050", config, refresh);
        },
        //购物车下单
        carPlaceOrder(config, refresh) {
            return Ajax.get("808051", config, refresh);
        },
        //购物车删除商品
        detailCarPro(config) {
            return Ajax.get("808041", config, true);
        },
        //编辑购物车商品数量
        editCarPro(config) {
            return Ajax.get("808042", config, true);
        },
        //批量支付订单
        payOrder(config, refresh) {
            return Ajax.get("808052", config, refresh);
        },
        // 获取订单详情
        getOrderDetail(code) {
            return Ajax.get("808066", {code});
        },
        // 分页查询购物车商品
        getPageCarProduct(config) {
            return Ajax.get("808045", {
                userId: base.getUserId(),
            	...config
            }, true);
        },
        // 获取购物车商品列表
        getCarProductList() {
            return Ajax.get("808047", {
                userId: base.getUserId()
            }, true);
        },
        // 我的订单分页查
        getPageOrders(config, refresh) {
            return Ajax.get("808068", {
                applyUser: base.getUserId(),
                ...config
            }, refresh);
        },
        // 取消订单
        cancelOrder(code) {
            return Ajax.get("808053", {
                userId: base.getUserId(),
            	code
            }, true);
        },
        // 确认收货
        confirmOrder(code) {
            return Ajax.get("808057", {
                updater: base.getUserId(),
            	code,
            	remark:'用户确认收货'
            }, true);
        },
        // 催单
        reminderOrder(code) {
            return Ajax.get("808058", {code}, true);
        },
        // 评论订单
        commentOrder(config){
            return Ajax.get("808059", {
                commenter : base.getUserId(),
                ...config
            }, true);
        },
        //获取运费
        getYunfei(config){
            return Ajax.get("808070", config, true);
        },
        // 删除用户取消订单
        deleteOrder(code) {
            return Ajax.get("808061", {
                updater: base.getUserId(),
            	code
            }, true);
        },
        // 查询订单可积分抵扣金额
        getDKAmount(code) {
            return Ajax.get("808071", {code}, true);
        },
        // 查询当前产品推荐奖励
        getBackAmount(productCode){
            return Ajax.get("808038", {productCode}, true);
        },
        // 申请退款
        applyReturnProduct(config){
            return Ajax.get("808080", config, true);
        },
        // 退货信息
        deliverReturnProduct(config){
            return Ajax.get("808082", config, true);
        }
    };
})
