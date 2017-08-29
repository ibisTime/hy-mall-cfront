define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        // 列表查询商品类型
        getListCategory(type, refresh) {
            return Ajax.get("808007", {
                status:'1',
                type
            }, refresh);
        },
        // 分页获取商品
        getPageProduct(config, refresh) {
            return Ajax.get("808025", {
                status:'3',
                companyCode: SYSTEM_CODE,
                ...config
            }, refresh);
        },
        // 详情查询商品
        getProductDetail(code) {
            return Ajax.get("808026", {code});
        },
    };
})
