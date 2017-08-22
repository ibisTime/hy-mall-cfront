define([
    'app/controller/base',
    'app/module/validate',
    'app/module/weixin',
    'app/interface/UserCtr',
    'app/interface/AccountCtr'
], function(base, Validate, weixin, UserCtr, AccountCtr) {
    var openId;
    init();
    function init() {
        base.showLoading();
        UserCtr.getUser().then((data) => {
            base.hideLoading();
            openId = data.openId;
        });
        addListeners();
    }
    // 充值
    function doRecharge(param) {
        base.showLoading("充值中...");
        param.amount = +param.amount * 1000;
        param.openId = openId;
        AccountCtr.recharge(param)
            .then(wxPay);
    }
    // 微信支付
    function wxPay(data) {
        if (data && data.signType) {
            weixin.initPay(data, () => {
                base.showMsg("支付成功");
                setTimeout(function(){
                    location.replace('../user/rmb-account.html')
                }, 500);
            }, () => {
                base.showMsg("支付失败");
            });
        } else {
            base.hideLoading();
            base.showMsg("微信支付失败");
        }
    }

    function addListeners() {
        var _formWrapper = $("#formWrapper");
        _formWrapper.validate({
            'rules': {
                amount: {
                    required: true,
                    isPositive: true,
                    amount: true
                }
            },
            onkeyup: false
        });
        $("#sbtn").click(function() {
            if (_formWrapper.valid()) {
                doRecharge(_formWrapper.serializeObject());
            }
        });
    }
});
