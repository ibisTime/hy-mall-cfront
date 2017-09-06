define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        // 列表查询类型
        getListCategory(refresh) {
            return Ajax.get("810007", {
                status:'1',
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
        }
    };
})
