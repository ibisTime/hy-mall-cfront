define([
    'app/controller/base',
    'app/module/foot',
    'app/module/scroll',
    'app/util/handlebarsHelpers',
    'app/interface/LeaseCtr',
    'app/interface/GeneralCtr',
], function(base, Foot, scroll, Handlebars, LeaseCtr, GeneralCtr) {
	var type = base.getUrlParam('type')||'';
    var _leaseTmpl = __inline('../../ui/lease-list-item.handlebars');
    var config = {
        start: 1,
        limit: 10,
        type: type||'',
        orderColumn:'order_no',
        orderDir:'asc'
    }, isEnd = false, canScrolling = false;
	var v = 6;
    var myScroll;

    init();
    
    function init(){
        Foot.addFoot(2);
        base.showLoading()
        $.when(
        	getListCategory(),
        	getPageLeaseProduct()
        )
        
        addListener();
    }
    
    //导航滑动
    function initScroll() {
        var width = 0;
        var _wrap = $("#am-tabs-bar");
        _wrap.find('.am-tabs-tab').each(function () {
            width += this.clientWidth;
        });
        _wrap.find('.scroll-content').css('width', width+ 1 + 'px');
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
	
	//获取导航
	function getListCategory(){
		LeaseCtr.getListCategory(true).then((data)=>{
			base.hideLoading()
			var html = '';
			
			data.forEach(function(d, i){
				html += `<div class="am-tabs-tab ${type== d.code?'am-tabs-tab-active':''}" data-code='${d.code}'>${d.name}</div>`;
				
				if(type == d.code){
					var _tabsInkBar = $("#am-tabs-bar").find(".am-tabs-ink-bar"),
			            _tabpanes = $("#am-tabs-content").find(".am-tabs-tabpane");
			            
		            _tabsInkBar.css({
		                "left": (i+1) * 1.82 + "rem"
		            });
		            _tabpanes.eq(i).removeClass("am-tabs-tabpane-inactive")
		                .siblings().addClass("am-tabs-tabpane-inactive");
				}
			})
			
        	$(".lease-category").append(html);
        	
	        if(!!type){
	    		$("#allCategory").removeClass('am-tabs-tab-active')
	            $("#am-tabs-bar").find(".am-tabs-ink-bar").removeClass('hidden');
	    	}else{
	    		$("#allCategory").addClass('am-tabs-tab-active')
	            $("#am-tabs-bar").find(".am-tabs-ink-bar").removeClass('hidden');
	    	}
        	
        	if(data.length>4){
        		initScroll();
        	}
		},()=>{})
        base.hideLoading();
	}
	
	//分页获取租赁商品
	function getPageLeaseProduct(refresh){
    	LeaseCtr.getPageLeaseProduct(config, refresh)
            .then(function(data) {
                base.hideLoading();
                var lists = data.list;
                var totalCount = data.totalCount;//+lists.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                }
    			if(lists.length) {
    				
                    $("#content").append(_leaseTmpl({items: lists}));
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
    			} else if(config.start == 1) {
                    $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无商品</p></div>')
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                canScrolling = true;
        	}, base.hideLoading);
	}
	
    function addListener(){
    	
		$(window).off("scroll").on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                base.showLoading();
                getPageLeaseProduct();
            }
        });
        
    	// tabs切换事件
        var _tabsInkBar = $("#am-tabs-bar").find(".am-tabs-ink-bar"),
            _tabpanes = $("#am-tabs-content").find(".am-tabs-tabpane");
        $("#am-tabs-bar").on("click", ".am-tabs-tab", function(){
            var _this = $(this), index = _this.index() - 1;
            if(!_this.hasClass("am-tabs-tab-active")){
                _this.addClass("am-tabs-tab-active")
                    .siblings(".am-tabs-tab-active").removeClass("am-tabs-tab-active");
                _tabsInkBar.css({
                    "left": index * 1.82 + "rem"
                });
                _tabpanes.eq(index).removeClass("am-tabs-tabpane-inactive")
                    .siblings().addClass("am-tabs-tabpane-inactive");
                
        		if(index>3){
                	myScroll.myScroll.scrollToElement(_this[0], 200, true);
            	}
                // 当前选择查看的tab的index
                config.start = 1;
                base.showLoading()
                var t = _this.attr('data-code')?_this.attr('data-code'):'';
                location.replace(location.href.split("?")[0]+'?type='+t)
                
            }
        });
        
        $("#search .searchText").focus(function(){
    		$(document).keyup(function(event){
				if(event.keyCode==13){
					if($("#search .searchText").val()&&$("#search .searchText").val()!=''){
						location.href = './lease-list.html?searchVal='+$("#search .searchText").val()
					}
				}
			}); 
    	})
    	$("#search .searchText").blur(function(){
			if (window.event.keyCode==13) window.event.keyCode=0 ;
    	})
		
		//收藏
		$("#content").on('click', '.lease-item .collect',function(){
			
			base.showLoading();
			if($(this).hasClass('active')){
				//取消收藏
				GeneralCtr.cancelCollecte($(this).attr('data-code'),'RP').then(()=>{
					$(this).removeClass('active')
					base.hideLoading();
					base.showMsg('取消成功')
				},()=>{
					base.hideLoading();
				})		
			}else{
				
				//收藏
				GeneralCtr.addCollecte($(this).attr('data-code'),'RP').then(()=>{
					$(this).addClass('active')
					base.hideLoading();
					base.showMsg('收藏成功')
				},()=>{
					base.hideLoading();
				})	
			}
		})
		
		
    }
});
