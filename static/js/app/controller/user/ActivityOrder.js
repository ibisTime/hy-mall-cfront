define([
    'app/controller/base',
    'app/util/dict',
    'app/module/scroll',
    'app/interface/ActivityStr',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr'
], function(base, Dict, scroll, ActivityStr, GeneralCtr, UserCtr) {
    var config = {
        start: 1,
        limit: 10
    }, isEnd = false, canScrolling = false;
    var orderStatus = {};
    var currentType = 0,
        type2Status = {
            "0": [],
            "1": ['1'],
            "2": ['2'],
            "3": ['4'],
            "4": ['3'],
            "5": ['8','9'],
            "6": ['5'],
        };
    var myScroll;

    if(base.getUserId()){
    	
    	init();
    }else{
    	base.showMsg('登录失效')
    	setTimeout(function(){
    		base.clearSessionUser();
    		base.goLogin()
    	},800)
    }
    
    function init(){
    	initScroll()
        base.showLoading();
        //获取状态数据字典
		GeneralCtr.getDictList({parentKey:'act_order_status'},'801907').then((data)=>{
    		data.forEach(function(d, i){
    			base.hideLoading()
    			orderStatus[d.dkey]=d.dvalue
    		})
    		
			$.when(
	        	getPageOrders()
	        )
		},base.hideLoading);
        
        addListener();
    }
    
    //导航滑动
    function initScroll() {
        var width = 0;
        var _wrap = $("#am-tabs-bar");
        _wrap.find('.am-tabs-tab').each(function () {
            width += this.clientWidth;
        });
        _wrap.find('.scroll-content').css('width', width+ 2 + 'px');
        myScroll = scroll.getInstance().getScrollByParam({
            id: 'am-tabs-bar',
            param: {
                scrollX: true,
                scrollY: false,
                eventPassthrough: true,
                snap: true,
                hideScrollbar: true,
                hScrollbar: false,
                vScrollbar: false
            }
        });
    }
    
    // 分页查询订单
    function getPageOrders(refresh) {
        return ActivityStr.getPageOrders({
            statusList: type2Status[currentType],
            ...config
        }, refresh)
            .then((data) => {
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
                    $("#content")[refresh || config.start == 1 ? "html" : "append"](html);
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
                } else if(config.start == 1) {
                    $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无订单</p></div>');
                    $("#loadAll").addClass("hidden");
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                !isEnd && $("#loadAll").addClass("hidden");
                canScrolling = true;
                base.hideLoading();
            }, base.hideLoading);
    }
    
    //订单列表
    function buildHtml(item) {
    	var tmplProHtml = '',tmplbtnHtml =' ',yunfei=item.totalYunfei||0;
    	
		tmplProHtml+=`<a class="mall-item" href="./activity-orderDetail.html?code=${item.code}">
		<div class="mall-item-img fl" style="background-image: url('${base.getImg(item.activity.advPic)}')"></div>
		<div class="mall-item-con fr">
			<p class="name">${item.activity.name}</p>
				<samp class="slogan">集合地:${item.activity.placeAsse}</samp>
				<samp class="slogan">目的地:${item.activity.placeDest}</samp>
				<samp class="slogan">${base.formatDate(item.activity.startDatetime, "yyyy-MM-dd")}至${base.formatDate(item.activity.endDatetime, "yyyy-MM-dd")}</samp>
				<div class="orderList-price">
    				<p>${orderStatus[item.status]}</p>
    			</div>
			</div></a>`
    	
    	//待支付
    	if(item.status == "1"){
    		tmplbtnHtml += `<div class="order-item-footer"><a class="am-button am-button-small am-button-red" href="../pay/pay.html?code=${item.code}&type=activity">立即支付</a>
                            <button class="am-button am-button-small cancel-order" data-code="${item.code}">取消订单</button></div>`
    	}
        return `<div class="order-item">
                    <div class="order-item-header">
                        <span>订单编号:${item.code}</span>
                        <span class="fr">${base.formatDate(item.applyDatetime, "yyyy-MM-dd")}</span>
                    </div>
                    <div class="orderPro-list orderList-pro">`+tmplProHtml+`</div><div class="totalAmout"><p>总价:<samp>￥${base.formatMoney(item.totalAmount)}</samp>
                    ${item.totalYunfei?'<span>(含运费:￥'+base.formatMoney(yunfei)+')</span>':''}</p></div>`+tmplbtnHtml+`</div></div>`;

    }
    
    //弹窗取消
    function dialgoClose(){
    	$("#dialog").addClass('hidden');
            
        $("#backType option").eq(0).prop("selected", 'selected');
		$("#backLogisticsCompany option").eq(0).prop("selected", 'selected');
		$("#backLogisticsCode").val("");
		$("#backAddress").val("");
    	$(".addbackPdf").removeClass('hidden')
		$("#backPdf").html("");
		$('#backPdf').attr('data-key','')
		$('#backStore option').eq(0).attr('selected','selected')
		$("#backStoreAddress .textarea").html($('#backStore option').eq(0).attr('data-address'))
		
		$("#dialog-returnAddress2").addClass('hidden')
		$("#returnAddressType").addClass('hidden')
		$('#returnAddressType select').val('2')
		
        $(".backLogisticsCompany").removeClass('hidden')
		$(".backLogisticsCode").removeClass('hidden')
		$(".backAddress").addClass('hidden')
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
                    
                myScroll.myScroll.scrollToElement(_this[0], 200, true);
                // 当前选择查看的订单tab的index
                currentType = index;
                config.start = 1;
                base.showLoading();
                getPageOrders();
            }
        });
        
        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                var choseIndex = $(".am-tabs-tab-active").index() - 1;
                base.showLoading();
                getPageOrders();
            }
        });
        
        //取消订单
        $("#orderWrapper").on("click", ".cancel-order", function() {
            var orderCode = $(this).attr("data-code");
            base.confirm("确定取消该预约吗？", "取消", "确认")
                .then(() => {
                    base.showLoading("取消中...");
                    ActivityStr.cancelOrder(orderCode)
                        .then(() => {
                            base.showMsg("取消成功");
                            base.showLoading();
                            config.start = 1;
                            getPageOrders(true);
                        });
                }, () => {});
        });
        
    }
    
});
