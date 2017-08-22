define([
    'app/controller/base',
    'app/interface/CourseCtr',
    'app/interface/CoachCtr',
    'app/interface/ActivityCtr',
    'app/interface/AccountCtr',
    'app/module/weixin'
], function(base, CourseCtr, CoachCtr, ActivityCtr, AccountCtr, weixin) {
    const COURSE_ORDER = "course", COACH_ORDER = "coach", ACTIVITY_ORDER = "activity";
    const BALANCE_PAY = 0, WX_PAY = 1;
    var code = base.getUrlParam("code"),
        type = base.getUrlParam("type"),
        pay_type = 0;

    init();
    function init(){
        if(!type) {
            base.showMsg("未传入订单类型");
        } else if(!code) {
            base.showMsg("未传入订单编号");
        } else {
            base.showLoading();
            getAccount();
            if(type == COURSE_ORDER) {
                getCourseOrder();
            } else if(type == COACH_ORDER) {
                getCoachOrder();
            } else if(type == ACTIVITY_ORDER) {
                getActivityOrder();
            }
            addListener();
        }
    }
    // 获取账户详情
    function getAccount() {
        AccountCtr.getAccount()
            .then((data) => {
                data.forEach((account) => {
                    if (account.currency == "CNY") {
                        $("#remainAmount").text(base.formatMoney(account.amount));
                    }
                });
            });
    }
    // 详情查询课程订单
    function getCourseOrder() {
        CourseCtr.getOrder(code)
            .then((data) => {
                base.hideLoading();
                $("#price").text(base.formatMoney(data.amount));
            });
    }
    // 详情查询私教订单
    function getCoachOrder() {
        CoachCtr.getOrder(code)
            .then((data) => {
                base.hideLoading();
                $("#price").text(base.formatMoney(data.amount));
            });
    }
    // 详情查询活动订单
    function getActivityOrder() {
        ActivityCtr.getOrder(code)
            .then((data) => {
                base.hideLoading();
                $("#price").text(base.formatMoney(data.amount));
            });
    }
    function addListener() {
        $("#payType").on("click", ".pay-item", function() {
            var _me = $(this);
            if(!_me.hasClass("active")) {
                _me.addClass("active").siblings(".active").removeClass("active");
                pay_type = _me.index();
            }
        });
        $("#payBtn").on("click", function(){
            base.showLoading("支付中...");
            if(pay_type == BALANCE_PAY) {   // 余额支付
                payByBalance();
            } else if(pay_type == WX_PAY) {   //微信支付
                payByWx();
            }
        });
    }
    function payByBalance() {
        if(type == COURSE_ORDER) {  // 课程订单
            payCourseOrder(code, 1);
        } else if(type == COACH_ORDER) {   // 私教订单
            payCoachOrder(code, 1);
        } else if(type == ACTIVITY_ORDER) { // 活动订单
            payActivityOrder(code, 1);
        }

    }
    function payByWx() {
        if(type == COURSE_ORDER) {  // 课程订单
            payCourseOrder(code, 5);
        } else if(type == COACH_ORDER){    //私教订单
            payCoachOrder(code, 5);
        } else if(type == ACTIVITY_ORDER) { // 活动订单
            payActivityOrder(code, 5);
        }
    }
    // 支付课程订单
    function payCourseOrder(code, payType) {
        CourseCtr.payOrder(code, payType)
            .then((data) => {
                if(pay_type == WX_PAY) {
                    wxPay(data);
                } else {
                    base.hideLoading();
                    base.showMsg("支付成功");
                    setTimeout(() => {
                        location.href = "../user/user.html";
                    }, 500);
                }
            });
    }
    // 支付私教订单
    function payCoachOrder(code, payType) {
        CoachCtr.payOrder(code, payType)
            .then((data) => {
                if(pay_type == WX_PAY) {
                    wxPay(data);
                } else {
                    base.hideLoading();
                    base.showMsg("支付成功");
                    setTimeout(() => {
                        location.href = "../user/user.html";
                    }, 500);
                }
            });
    }
    // 支付活动订单
    function payActivityOrder(code, payType) {
        ActivityCtr.payOrder(code, payType)
            .then((data) => {
                if(pay_type == WX_PAY) {
                    wxPay(data);
                } else {
                    base.hideLoading();
                    base.showMsg("支付成功");
                    setTimeout(() => {
                        location.href = "../user/user.html";
                    }, 500);
                }
            });
    }
    function wxPay(data) {
        if (data && data.signType) {
            weixin.initPay(data, () => {
                base.showMsg("支付成功");
                setTimeout(function(){
                    location.href = "../user/user.html";
                }, 500);
            }, () => {
                base.showMsg("支付失败");
            });
        } else {
            base.hideLoading();
            base.showMsg("微信支付失败");
        }
    }
});
