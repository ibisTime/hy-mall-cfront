define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        /**
         * 微信登录
         * @param config: {code,mobile?,smsCaptcha?,userReferee?}
         */
        wxLogin(config) {
            return Ajax.post("805151", config);
        },
        // 获取用户详情
        getUser(refresh) {
            return Ajax.get("805056", {
                "userId": base.getUserId()
            }, refresh);
        },
        /**
         * 分页查询获客
         * @param config: {code,mobile?,smsCaptcha?,userReferee}
         */
        getPageChildren(config, refresh) {
            return Ajax.get("805054", {
                userReferee: base.getUserId(),
                ...config
            }, refresh);
        },
        // 绑定手机号
        bindMobile(mobile, smsCaptcha) {
            return Ajax.post("805151", {
                mobile,
                smsCaptcha,
                userId: base.getUserId()
            });
        },
        // 设置支付密码
        setTradePwd(tradePwd, smsCaptcha) {
            return Ajax.post('805045', {
                tradePwd,
                smsCaptcha,
                tradePwdStrength: base.calculateSecurityLevel(tradePwd),
                userId: base.getUserId()
            });
        },
        // 修改手机号
        changeMobile(newMobile, smsCaptcha) {
            return Ajax.post("805047", {
                newMobile,
                smsCaptcha,
                userId: base.getUserId()
            });
        },
        // 详情查询银行卡
        getBankCard(code) {
            return Ajax.get("802017", {code});
        },
        // 列表查询银行的数据字典
        getBankList(){
            return Ajax.get("802116");
        },
        // 新增或修改银行卡
        addOrEditBankCard(config) {
            return config.code ? this.editBankCard(config) : this.addBankCard(config);
        },
        // 修改银行卡
        editBankCard(config) {
            return Ajax.post("802012", {
                userId: base.getUserId(),
                ...config
            });
        },
        // 新增银行卡
        addBankCard(config) {
            return Ajax.post("802010", {
                userId: base.getUserId(),
                ...config
            });
        },
        // 列表查询银行卡
        getBankCardList(refresh) {
            return Ajax.get("802016", {
                userId: base.getUserId(),
                status: "1"
            }, refresh);
        },
        /**
         * 分页查询银行卡
         * @param config: {start, limit}
         */
        getPageBankCard(config, refresh) {
            return Ajax.get("802015", {
                userId: base.getUserId(),
                status: "1",
                ...config
            }, refresh);
        },
        // 获取未完成的订单数量
        getUnfinishedOrders() {
            return Ajax.get("622920", {
                applyUser: base.getUserId()
            });
        }
    };
})
