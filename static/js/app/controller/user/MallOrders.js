define([
    'app/controller/base',
    'app/util/dict',
    'app/interface/MallCtr'
], function(base, Dict, MallCtr) {
    var config = {
        start: 1,
        limit: 10
    }, isEnd = false, canScrolling = false;
    var orderStatus = Dict.get("mallOrderStatus");
    var currentType = 0,
        type2Status = {
            "0": [],
            "1": ['1'],
            "2": ['2'],
            "3": ['3'],
            "4": ['4'],
            "5": ['91','92','93'],
        };
    const SUFFIX = "?imageMogr2/auto-orient/thumbnail/!150x113r";

    init();
    function init(){
        addListener();
        base.showLoading();
        getPageOrders();
    }
    // 分页查询订单
    function getPageOrders(refresh) {
                base.hideLoading();
        return MallCtr.getPageOrders({
            statusList: type2Status[currentType],
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
    
    //订单列表
    function buildHtml(item) {
    	var tmplProHtml = '',tmplbtnHtml =' ';
    	
    	item.productOrderList.forEach(function(d, i){
    		tmplProHtml+=`<a class="mall-item" href="./mall-orderDetail.html?code=${item.code}">
    		<div class="mall-item-img fl" style="background-image: url('${base.getImg(d.product.advPic)}')"></div>
    		<div class="mall-item-con fr">
    			<p class="name">${d.product.name}</p>
    			<samp class="slogan">商品规格：${d.productSpecsName}</samp>
    			<div class="price orderList-price">
    				<p class="samp1">${d.price2 ? base.formatMoney(d.price2)+'积分' : '￥'+base.formatMoney(d.price1)}</p>
    				<p class="samp2">x${d.quantity}</p>
    			</div>
    			</div></a>`
    	})
    	
    	//待支付
    	if(item.status == "1"){
    		tmplbtnHtml += `<div class="order-item-footer"><a class="am-button am-button-small am-button-red" href="../pay/pay.html?code=${item.code}&type=mall">立即支付</a>
                            <button class="am-button am-button-small cancel-order" data-code="${item.code}">取消订单</button></div>`
    	
    	// 已支付，待发货
    	}else if(item.status == "2"){
    		tmplbtnHtml += `<div class="order-item-footer"><button class="am-button am-button-small am-button-red " data-code="${item.code}">待发货</button></div>`
    	
    	//已发货
    	}else if(item.status == "3"){
    		tmplbtnHtml += `<div class="order-item-footer"><button class="am-button am-button-small am-button-red confirm-order" data-code="${item.code}">确认收货</button></div>`
    	
    	// 已收货
    	}else if(item.status == "4"){
    		tmplbtnHtml += `<div class="order-item-footer"><button class="am-button am-button-small am-button-red" data-code="${item.code}">已收货</button></div>`
    	
    	//91：用户异常 ，92：商户异常， 93：快递异常
    	}else if(item.status == "91"||item.status == "92"||item.status == "93"){
    		tmplbtnHtml += `<div class="order-item-footer"><button class="am-button am-button-small" data-code="${item.code}">已取消</button></div>`
    	}
    	
        return `<div class="order-item">
                    <div class="order-item-header">
                        <span>订单编号:${item.code}</span>
                        <span class="fr">${base.formatDate(item.applyDatetime, "yyyy-MM-dd")}</span>
                    </div>
                    <div class="orderPro-list orderList-pro">`+tmplProHtml+`</div><div class="totalAmout">总价:<samp>
                    ${item.amount1&&item.amount2
                    	? '￥'+base.formatMoney(item.amount1)+' + '+base.formatMoney(item.amount2)+'积分'
                    	:item.amount1?'￥'+base.formatMoney(item.amount1):base.formatMoney(item.amount2)+'积分'}
                    </samp></div>`+tmplbtnHtml+`</div>`;

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
                    "-webkit-transform": "translate3d(" + index * 1.25 + "rem, 0px, 0px)",
                    "-moz-transform": "translate3d(" + index * 1.25 + "rem, 0px, 0px)",
                    "transform": "translate3d(" + index * 1.25 + "rem, 0px, 0px)"
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
                    MallCtr.cancelOrder(orderCode)
                        .then(() => {
                            base.showMsg("取消成功");
                            base.showLoading();
                            config.start = 1;
                            getPageOrders(true);
                        });
                }, () => {});
        });
        $("#orderWrapper").on("click", ".confirm-order", function() {
            var orderCode = $(this).attr("data-code");
            base.confirm('确认收货吗？')
                .then(() => {
                    base.showLoading("提交中...");
                    MallCtr.confirmOrder(orderCode)
                        .then(() => {
                            base.showMsg("操作成功");
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
