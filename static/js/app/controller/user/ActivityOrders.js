define([
    'app/controller/base',
    'app/util/dict',
    'app/interface/ActivityCtr'
], function(base, Dict, ActivityCtr) {
    var config = {
        start: 1,
        limit: 10
    }, isEnd = false, canScrolling = false;
    var orderStatus = Dict.get("activityOrderStatus");
    var currentType = 0,
        // "0": 待付款, "1": "付款成功", "2": "用户取消订单", "3": "平台取消订单",
        // "4": "退款申请", "5": "退款成功", "6": "退款失败", "7": "活动开始", "8": "已完成"
        type2Status = {
            "0": "",
            "1": "0",
            "2": "1",
            "3": "7",
            "4": "8"
        };
    const SUFFIX = "?imageMogr2/auto-orient/thumbnail/!150x113r";

    init();
    function init(){
        addListener();
        base.showLoading();
        getPageOrders();
    }
    // 分页查询课程
    function getPageOrders(refresh) {
        return ActivityCtr.getPageOrders({
            status: type2Status[currentType],
            ...config
        }, refresh)
            .then((data) => {
                base.hideLoading();
                hideLoading(currentType);
                var lists = data.list;
                var totalCount = +data.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                } else {
                    isEnd = false;
                }
                if(data.list.length) {
                    var html = "";
                    lists.forEach((item) => {
                        html += buildHtml(item);
                    });
                    $("#content" + currentType)[refresh || config.start == 1 ? "html" : "append"](html);
                    isEnd && $("#loadAll" + currentType).removeClass("hidden");
                    config.start++;
                } else if(config.start == 1) {
                    $("#content" + currentType).html('<div class="no-data">暂无订单</div>');
                    $("#loadAll" + currentType).addClass("hidden");
                } else {
                    $("#loadAll" + currentType).removeClass("hidden");
                }
                !isEnd && $("#loadAll" + currentType).addClass("hidden");
                canScrolling = true;
            }, () => hideLoading(currentType));
    }
    function buildHtml(item) {
        return `<div class="order-item">
                    <div class="order-item-header">
                        <span>${item.code}</span>
                        <span class="fr">${base.formatDate(item.applyDatetime, "yyyy-MM-dd")}</span>
                    </div>
                    <a href="./activity-order.html?code=${item.code}" class="order-item-cont">
                        <div class="am-flexbox am-flexbox-align-top">
                            <div class="order-img">
                                <img src="${base.getImg(item.pic, SUFFIX)}"/>
                            </div>
                            <div class="order-name-infos am-flexbox-item">
                                <div class="am-flexbox am-flexbox-dir-column am-flexbox-justify-between am-flexbox-align-top">
                                    <div>
                                        <h1>${item.activityTitle}</h1>
                                        <div class="order-infos">
                                            <span class="pdr">${base.formatDate(item.activityBeginDatetime, "MM-dd hh:mm")} ~ ${base.formatDate(item.activityEndDatetime, "MM-dd hh:mm")}</span>
                                        </div>
                                    </div>
                                    <div class="order-desc">
                                        <span class="t-3dot">${item.quantity}人</span>
                                    </div>
                                </div>
                            </div>
                            <div class="order-status">${currentType == 0 ? orderStatus[item.status] : "¥" + base.formatMoney(item.amount)}</div>
                        </div>
                    </a>
                    ${
                        item.status == "0" || item.status == "1"
                            ? `<div class="order-item-footer">
                                    ${
                                        item.status == "0"
                                            ? `<a class="am-button am-button-small" href="../pay/pay.html?code=${item.code}&type=activity">立即支付</a>
                                                <button class="am-button am-button-small cancel-order" data-code="${item.code}">取消订单</button>`
                                            : `<button class="am-button am-button-small refund-order" data-code="${item.code}">申请退款</button>`
                                    }
                                </div>`
                            : ''
                    }
                </div>`;
        // "0": 待付款, "1": "付款成功", "2": "用户取消订单", "3": "平台取消订单",
        // "4": "退款申请", "5": "退款成功", "6": "退款失败", "7": "活动开始", "8": "已完成"
    }

    function addListener(){
        // tabs切换事件
        var _tabsInkBar = $("#am-tabs-bar").find(".am-tabs-ink-bar"),
            _tabpanes = $("#am-tabs-content").find(".am-tabs-tabpane");
        $("#am-tabs-bar").on("click", ".am-tabs-tab", function(){
            var _this = $(this), index = _this.index() - 1;
            if(!_this.hasClass("am-tabs-tab-active")){
                _this.addClass("am-tabs-tab-active")
                    .siblings(".am-tabs-tab-active").removeClass("am-tabs-tab-active");
                _tabsInkBar.css({
                    "-webkit-transform": "translate3d(" + index * 1.5 + "rem, 0px, 0px)",
                    "-moz-transform": "translate3d(" + index * 1.5 + "rem, 0px, 0px)",
                    "transform": "translate3d(" + index * 1.5 + "rem, 0px, 0px)"
                });
                _tabpanes.eq(index).removeClass("am-tabs-tabpane-inactive")
                    .siblings().addClass("am-tabs-tabpane-inactive");
                // 当前选择查看的订单tab的index
                currentType = index;
                config.start = 1;
                base.showLoading();
                getPageOrders();
            }
        });
        $("#orderWrapper").on("click", ".cancel-order", function() {
            var orderCode = $(this).attr("data-code");
            base.confirm("确定取消订单吗？", "取消", "确认")
                .then(() => {
                    base.showLoading("取消中...");
                    ActivityCtr.cancelOrder(orderCode)
                        .then(() => {
                            base.showMsg("取消成功");
                            base.showLoading();
                            config.start = 1;
                            getPageOrders(true);
                        });
                }, () => {});
        });
        $("#orderWrapper").on("click", ".refund-order", function() {
            var orderCode = $(this).attr("data-code");
            base.confirm('确定申请退款吗')
                .then(() => {
                    base.showLoading("提交中...");
                    ActivityCtr.refundOrder(orderCode)
                        .then(() => {
                            base.showMsg("申请提交成功");
                            base.showLoading();
                            config.start = 1;
                            getPageOrders(true);
                        });
                }, () => {});
        });

        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                var choseIndex = $(".am-tabs-tab-active").index() - 1;
                showLoading();
                getPageOrders();
            }
        });
    }
    function showLoading() {
        $("#loadingWrap" + currentType).removeClass("hidden");
    }

    function hideLoading() {
        $("#loadingWrap" + currentType).addClass("hidden");
    }
});
