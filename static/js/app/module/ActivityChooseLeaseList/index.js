define([
    'jquery',
    'app/controller/base',
    'app/util/handlebarsHelpers',
    'app/interface/LeaseCtr',
    'app/module/ActivityChooseLeaseSubmit',
    'app/module/scroll',
], function ($, base, Handlebars, LeaseCtr, ActivityChooseLeaseSubmit, scroll) {
    var tmpl = __inline("index.html");
    var _mallTmpl = __inline('../../ui/mall-list-lease.handlebars');
    var defaultOpt = {};
    var firstAdd = true;
    var myScroll,
    	lType;
    var start = 1,
        limit = 10,
        isEnd = false,
        canScrolling = false;
    var proList = [];

    function initData(){
        base.showLoading();
        
        start = 1;
        getListCategory();
    }
    // 获取商品大类
    function getListCategory(){
        LeaseCtr.getListCategory(true)
            .then(function(data) {
                var html = '<li l_type="NJ04" class="allCategory">全部分类</li>', html1 = '<li l_type="" class="wp33 tc fl allCategory">全部分类</li>';
                for (var i = 0; i < data.length; i++) {
                    var d = data[i];
                    if(d.code!=JFLEASEPRODUCTTYPE){
                    	html += `<li l_type="${d.code}">${d.name}</li>`;
                    	html1 += `<li l_type="${d.code}" class="wp33 tc fl">${d.name}</li>`;
                    }
                }
                var scroller = $("#leaseScroller");
                scroller.find("ul").html(html);
                $("#lCateAllItem").find("ul").html(html1);
            	addCategory();
                scroller.find("ul li")[0].click();
            });
    }
    // 添加大类
    function addCategory() {
    	scroll.getInstance().refresh();
        var scroller = $("#leaseScroller");
        var lis = scroller.find("ul li");
        var width = 0;
        for (var i = 0; i < lis.length; i++) {
            width += $(lis[i]).outerWidth(true)+0.5;
        }
        $("#leaseScroller").css("width", width);
        myScroll = scroll.getInstance().getScrollByParam({
            id: 'leaseWrapper',
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
    
    //租赁分页查
	function getPageLeaseList(c,refresh){
		LeaseCtr.getPageLeaseProduct({
	        start: start,
	        limit: limit,
	        orderColumn:'order_no',
	        orderDir:'asc',
	        type: c,
		}, refresh)
            .then(function(data) {
                base.hideLoading();
                var lists = data.list;
                var totalCount = data.totalCount;//+lists.totalCount;
                if (totalCount <= limit || lists.length < limit) {
                    isEnd = true;
                }
    			if(lists.length) {
    				
                    $("#LeaseListContainer .chooseMallList-wrap")[refresh || start == 1 ? "html" : "append"](_mallTmpl({items: lists}));
                    isEnd && $("#leaseloadAll").removeClass("hidden");
                    start++;
    			} else if(start == 1) {
                    $("#LeaseListContainer .chooseMallList-wrap").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无租赁</p></div>')
                } else {
                    $("#leaseloadAll").removeClass("hidden");
                }
                canScrolling = true;
        	}, base.hideLoading);
	}
	
    function addListener(){
    	/**大类start */
        $("#lCateDown").on("click", function() {
            var me = $(this);
            if (me.hasClass("down-arrow")) {
                $("#lCateAllCont").removeClass("hidden");
                me.removeClass("down-arrow").addClass("up-arrow");
            } else {
                $("#lCateAllCont").addClass("hidden");
                me.removeClass("up-arrow").addClass("down-arrow");
            }
        });
        $("#mall-mask").on("click", function() {
            $("#lCateDown").click();
        });
        $("#lCateAllItem").on("click", "li", function() {
            var lType = $(this).attr("l_type");
            $("#leaseScroller").find("li[l_type='" + lType + "']").click();
            $("#lCateDown").click();
        });
        $("#leaseScroller").on("click", "li", function() {
            var me = $(this);
            $("#leaseWrapper").find(".current").removeClass("current");
            me.addClass("current");
            myScroll.myScroll.scrollToElement(this);
            lType = me.attr("l_type");
            start = 1;
            isEnd = false;
            base.showLoading();
            $("#leaseloadAll").addClass("hidden");
            
            getPageLeaseList(lType, true);
        	$("#leaTableHeight").css({"height":$(".mall_list_top").height()})
        	
            var allItem = $("#lCateAllItem");
            allItem.find("li.current").removeClass("current");
            allItem.find("li[l_type='" + lType + "']").addClass("current");
        });
        /**大类end */
    	
        //重新选择
        $("#LeaseListContainer").on("click", ".right-left-btn .resetBtn", function(){
        	proList = [];
        	$("#LeaseListContainer .chooseMallList-wrap .mall-item").removeClass("active")
        });
        
        var _activeLease; //当前点击的商品
        
        //租赁面板
		ActivityChooseLeaseSubmit.addCont({
        	success: function(leaseData) {
        		
        		_activeLease.attr("data-totalAmount",leaseData.totalAmount)
        		_activeLease.attr("data-quantity",leaseData.quantity)
        		_activeLease.attr("data-startDate",leaseData.startDate)
        		_activeLease.attr("data-endDate",leaseData.endDate)
        		_activeLease.attr("data-rentDay",leaseData.rentDay)
        		_activeLease.attr("data-deposit",leaseData.deposit)
        		
        		_activeLease.find(".price .samp1").text('￥'+base.formatMoney(leaseData.totalAmount))
				_activeLease.find(".price .samp2").text('(含押金:￥'+base.formatMoney(leaseData.deposit)+")")
        		_activeLease.find(".rentDays").html("租期："+leaseData.rentDay+"&nbsp;&nbsp;&nbsp;&nbsp;数量：X"+leaseData.quantity)
        		_activeLease.find(".data").text("租赁日期："+leaseData.startDate+"至"+leaseData.endDate)
        		
        		_activeLease.addClass("active")
        	}
        });
        
        //商品选择
        $("#LeaseListContainer .chooseMallList-wrap").on("click",".mall-item", function(){
        	
        	if($(this).hasClass("active")){
        		$(this).removeClass("active")
        	}else{
        		_activeLease= $(this);
        		
        		ActivityChooseLeaseSubmit.showCont({
        			code: _activeLease.attr("data-code")
        		})
        	}
        })
        
        
	}
    
    function doError(cc) {
        $(cc).html('<div style="text-align: center;line-height: 3;">暂无数据</div>');
    }

    var ModuleObj = {
        addCont: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasCont()){
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var wrap = $("#LeaseListContainer");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").text(defaultOpt.title);
            var that = this;
            if(firstAdd){
            	
        		addListener();
        		
                wrap.on("click", ".right-left-cont-back", function(){
                	proList=[]
                    ModuleObj.hideCont(defaultOpt.success);
                });
                
                wrap.on("click", ".right-left-btn .subBtn", function(){
                	proList=[];
					$("#LeaseListContainer .chooseMallList-wrap .mall-item").each(function(){
						if($(this).hasClass("active")){
							var pro = {
								code: $(this).attr("data-code"),
								name: $(this).find(".name").text(),
								advPic: $(this).find(".mall-item-img").attr("data-advPic"),
								price: $(this).attr("data-totalAmount"),
								quantity: $(this).attr("data-quantity"),
								startDate: $(this).attr("data-startDate"),
								endDate: $(this).attr("data-endDate"),
								rentDay: $(this).attr("data-rentDay"),
								deposit: $(this).attr("data-deposit")
							}
							
							proList.push(pro)
						}
					})
                    ModuleObj.hideCont(defaultOpt.success);
                });
                
            }

            firstAdd = false;
            return this;
        },
        hasCont: function(){
            return !!$("#LeaseListContainer").length;
        },
        showCont: function (option = {}){
            if(this.hasCont()){
            	if(option.code) {
                    defaultOpt.code = option.code;
                } else {
                    defaultOpt.code = "";
                }
                initData();
                ModuleObj._showCont();
            }
            return this;
        },
        _showCont: function(){
            var wrap = $("#LeaseListContainer");
            wrap.show().animate({
                left: 0
            }, 200, function(){
                defaultOpt.showFun && defaultOpt.showFun();
            });
            
            var topWrap = wrap.find(".right-left-cont-title");
            topWrap.show().animate({
                left: 0
            }, 200, function () {
            });
            
            var navWrap = wrap.find(".mall_list_top")
            navWrap.show().animate({
                left: 0
            }, 200, function () {
            });
            
            var btnWrap = wrap.find(".right-left-btn");
            btnWrap.show().animate({
                left: 0
            }, 200, function () {
            });
            
            //下拉加载
            wrap.off("scroll").on("scroll", function() {
                if (canScrolling && !isEnd && (wrap.scrollTop()>=wrap.find(".right-left-content").height()-wrap.height()-20)) {
                	
                    canScrolling = false;
                    base.showLoading();
                    getPageLeaseList(lType);
                }
            });
        },
        hideCont: function (func){
            if(this.hasCont()){
                var wrap = $("#LeaseListContainer");
                
            	var topWrap = wrap.find(".right-left-cont-title");
                topWrap.animate({
                    left: "100%"
                }, 200, function () {
                });
            	
	            var navWrap = wrap.find(".mall_list_top")
	            navWrap.animate({
                    left: "100%"
                }, 200, function () {
                });	  
                
                var btnWrap = wrap.find(".right-left-btn");
                btnWrap.animate({
                    left: "100%"
                }, 200, function () {
                    btnWrap.hide();
                });
                
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func(proList);
                    wrap.find("label.error").remove();
                });
                
            }
            return this;
        }
    }
    return ModuleObj;
});
