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
    };
})
