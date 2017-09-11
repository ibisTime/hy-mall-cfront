define([
    'app/controller/base',
    'app/module/foot',
    'app/util/handlebarsHelpers',
    'app/interface/MallCtr',
], function(base, Foot, Handlebars, MallCtr) {
    var _proTmpl = __inline('../../ui/mall-list-item.handlebars');
    var type = base.getUrlParam('type');
    var searchVal = base.getUrlParam('searchVal') || "";
    var config = {
        start: 1,
        limit: 10,
        type: type,
        name: searchVal
    }, isEnd = false, canScrolling = false;
    
    init();

	function init(){
        Foot.addFoot(1);
        base.showLoading();
        
    	$("#search .searchText").val(searchVal)
    	getPageProduct();
        addListener()
	}
	
	function getPageProduct(refresh){
    	MallCtr.getPageProduct(config, refresh)
            .then(function(data) {
                base.hideLoading();
                var lists = data.list;
                var totalCount = data.totalCount;//+lists.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                }
    			if(lists.length) {
    				var html = '';
    				
    				
                    $("#content").append(_proTmpl({items: lists}));
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
    			} else if(config.start == 1) {
                    $("#content").html('<li class="no-data">暂无相关商品</li>')
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
                getPageProduct();
            }
        });
        
		$("#goTop").click(()=>{
			var speed=200;//滑动的速度
	        $('body,html').animate({ scrollTop: 0 }, speed);
	        return false;
		})
		
		$("#search .searchIcon").click(function(){
			location.href = './mall-list.html?searchVal='+$("#search .searchText").val()
		})
		
	}
	
})