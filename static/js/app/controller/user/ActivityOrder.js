define([
    'app/controller/base',
    'app/util/dict',
    'app/module/validate',
    'app/module/scroll',
    'app/interface/ActivityStr',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr'
], function(base, Dict, Validate, scroll, ActivityStr, GeneralCtr, UserCtr) {
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
            "5": ['8','9','6'],
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
    			orderStatus[d.dkey]=d.dvalue
    		})
    		
			$.when(
	        	getPageOrders(),
	        	getContact()
	        )
		},base.hideLoading);
        
        addListener();
    }
    
    // 获取联系客服方式
    function getContact(){
    	return GeneralCtr.getPageUserSysConfig()
			.then(function(data){
                data.list.forEach((item) => {
                    if(item.ckey == "custom_center") {
                    	$("#description").html(item.cvalue);
                    } else if(item.ckey == "telephone") {
                        $("#tel span").text(item.cvalue);
                        $("#tel").attr('href','tel://'+item.cvalue)
                    } else if(item.ckey == "time") {
                        $("#time span").text(item.cvalue);
                    }
                });
			});
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
                base.hideLoading();
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
				<samp class="slogan">${base.formatDate(item.activity.startDatetime, "yyyy-MM-dd hh:mm")}至${base.formatDate(item.activity.endDatetime, "yyyy-MM-dd hh:mm")}</samp>
				<div class="orderList-price">
    				<p>${orderStatus[item.status]}</p>
    			</div>
			</div></a>`
    	
    	//待支付
    	if(item.status == "1"){
    		tmplbtnHtml += `<div class="order-item-footer"><a class="am-button am-button-small am-button-red" href="../pay/pay.html?code=${item.code}&type=activity">立即支付</a>
                            <button class="am-button am-button-small cancel-order" data-code="${item.code}">取消订单</button></div>`
    	} else {
    		tmplbtnHtml += `<div class="order-item-footer">`
    		
    		if(item.status == '2' && item.activity.amountType != '0'){
    			tmplbtnHtml += `<button class="am-button am-button-small return-order am-button-red" data-code="${item.code}">申请退款</button>`
    		}
    		tmplbtnHtml += `<button class="am-button am-button-small am-button-glost contact-btn">联系客服</button></div>`
    	}
        return `<div class="order-item">
                    <div class="order-item-header">
                        <span>订单编号:${item.code}</span>
                        <span class="fr">${base.formatDate(item.applyDatetime, "yyyy-MM-dd")}</span>
                    </div>
                    <div class="orderPro-list orderList-pro">`+tmplProHtml+`</div><div class="totalAmout"><p>总价:<samp>￥${base.formatMoney(item.totalAmount1)}</samp>
                    </p></div>`+tmplbtnHtml+`</div></div>`;

    }
    
	//申请退款弹窗-关闭
	function applyReturnDialogClose(){
    	$("#applyReturnDialog").addClass('hidden');
    	$("#applyReturnDialog .confirm").attr("data-code", '');
    	$("#applyReturnForm").get(0).reset();
	}
	
	// 申请退款
	function returnOrder(params){
		return ActivityStr.returnOrder(params).then(()=>{
			applyReturnDialogClose();
			base.hideLoading();
			base.showMsg('操作成功！')
			
			setTimeout(function(){
				location.reload(true);
			},800)
		}, base.hideLoading)
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
        
        //联系客服
        $("#orderWrapper").on("click", ".contact-btn", function() {
        	$("#contactDialog").removeClass("hidden")
        });
        
        //联系客服弹窗-关闭
        $("#contactDialog .canlce").click(function(){
        	$("#contactDialog").addClass("hidden")
        })
        
        var touchFalg = false;
        //申请退货---- start
        var _applyReturnForm = $("#applyReturnForm");
        _applyReturnForm.validate({
            'rules': {
                remark: {
                }
            },
            onkeyup: false
        });
        
        //申请退货弹窗-取消
        $("#applyReturnDialog .canlce").click(function(){
        	touchFalg = false
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        	
            applyReturnDialogClose();
        })
        
        //申请退货弹窗-确定
        $("#applyReturnDialog .confirm").click(function(){
        	var productCode =$(this).attr('data-code');
        	var params = _applyReturnForm.serializeObject();
        	if(_applyReturnForm.valid()){
        		params.code = productCode;
        		base.showLoading();
        		returnOrder(params);
        	}
        })
        //申请退货---- end
        
        //申请退款按钮
        $("#orderWrapper").on('click', '.return-order', function(){
        	$("#applyReturnDialog .confirm").attr("data-code", $(this).attr("data-code"));
    		$("#applyReturnDialog").removeClass('hidden');
    		
    		touchFalg = true
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        })
    }
    
});
