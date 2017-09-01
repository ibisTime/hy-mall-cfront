define([
    'app/controller/base',
    'app/interface/ActivityCtr',
    'app/util/dict'
], function(base, ActivityCtr, Dict) {
    var code = base.getUrlParam("code"),
        orderStatus = Dict.get("activityOrderStatus");

    init();
    function init(){
        addListener();
        base.showLoading();
        getOrder();
    }
    function getOrder(refresh) {
        ActivityCtr.getOrder(code, refresh)
            .then((data) => {
                base.hideLoading();
                $("#code").text(data.code);
                $("#applyDatetime").text(base.formatDate(data.applyDatetime, "yyyy-MM-dd hh:mm"));
                // "0": 待付款, "1": "付款成功", "2": "用户取消订单", "3": "平台取消订单",
                // "4": "退款申请", "5": "退款成功", "6": "退款失败", "7": "活动开始", "8": "已完成"
                $("#status").text(orderStatus[data.status]);
                $("#activityTitle").html(`<a class="under" href="../notice/activity.html?code=${data.activityCode}">${data.activityTitle}</a>`);
                $("#activityBeginDatetime").text(base.formatDate(data.activityBeginDatetime, "yyyy-MM-dd hh:mm"));
                $("#activityEndDatetime").text(base.formatDate(data.activityEndDatetime, "yyyy-MM-dd hh:mm"));
                $("#contact").html(`<a href="tel://${data.contact}">${data.contact}</a>`);
                $("#quantity").text(data.quantity);
                $("#amount").text(base.formatMoney(data.amount) + "元");
                if(data.penalty) {
                    $("#penalty").text(base.formatMoney(data.penalty) + "元")
                        .closest(".confirm-item").removeClass("hidden");
                }
                $("#applyNote").text(data.applyNote || "无");
                if(data.remark) {
                    $("#remark").text(data.remark)
                        .closest(".confirm-item").removeClass("hidden");
                }
                if(refresh) {
                    $(".confirm-btn").find("button").addClass("hidden");
                }
                if(status == "0") {
                    $("#payBtn, #cancelBtn").removeClass("hidden");
                } else if(status == "1") {
                    $("#refundBtn").removeClass("hidden");
                }
            });
    }
    function addListener(){
        $("#cancelBtn").on("click", function() {
            base.confirm("确定取消订单吗？", "取消", "确认")
                .then(() => {
                    base.showLoading("取消中...");
                    ActivityCtr.cancelOrder(code)
                        .then(() => {
                            base.showMsg("取消成功");
                            base.showLoading();
                            getOrder(true);
                        });
                }, () => {});
        });
        $("#refundBtn").on("click", function() {
            base.confirm('确定申请退款吗')
                .then(() => {
                    base.showLoading("提交中...");
                    ActivityCtr.refundOrder(code)
                        .then(() => {
                            base.showMsg("申请提交成功");
                            base.showLoading();
                            getOrder(true);
                        });
                }, () => {});
        });
        $("#payBtn").on("click", function() {
            location.href = "../pay/pay.html?type=activity&code=" + code;
        });
    }
});
