define([
    'jquery',
    'app/controller/base',
    'app/util/handlebarsHelpers',
    'app/interface/LeaseCtr',
    'app/module/ActivityChooseLeaseSubmit',
], function ($, base, Handlebars, LeaseCtr, ActivityChooseLeaseSubmit) {
    var tmpl = __inline("index.html");
    var _mallTmpl = __inline('../../ui/mall-list-lease.handlebars');
    var defaultOpt = {};
    var firstAdd = true;
    var config = {
        start: 1,
        limit: 10,
        orderColumn:'order_no',
        orderDir:'asc',
        category: 'NJ04',
    }, isEnd = false, canScrolling = false;
    var proList = [];

    function initData(){
        base.showLoading();
        
        config.start = 1;
        getPageLeaseList(true);
    }
    
    //租赁分页查
	function getPageLeaseList(refresh){
		LeaseCtr.getPageLeaseProduct(config, refresh)
            .then(function(data) {
                base.hideLoading();
                var lists = data.list;
                var totalCount = data.totalCount;//+lists.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                }
    			if(lists.length) {
    				
                    $("#LeaseListContainer .chooseMallList-wrap")[refresh || config.start == 1 ? "html" : "append"](_mallTmpl({items: lists}));
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
    			} else if(config.start == 1) {
                    $("#LeaseListContainer .chooseMallList-wrap").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无租赁</p></div>')
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                canScrolling = true;
        	}, base.hideLoading);
	}
	
    function addListener(){
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
                    getPageLeaseList();
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
                    btnWrap.hide();
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
