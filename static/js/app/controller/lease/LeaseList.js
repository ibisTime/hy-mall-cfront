define([
    'app/controller/base',
    'app/module/foot',
    'app/module/scroll',
    'app/util/handlebarsHelpers',
    'app/interface/LeaseCtr',
], function(base, Foot, scroll, Handlebars, LeaseCtr) {
    var searchVal = base.getUrlParam('searchVal') || "";
    var _leaseTmpl = __inline('../../ui/lease-list-item.handlebars');
    var config = {
        start: 1,
        limit: 10,
        name: searchVal,
        orderColumn:'order_no',
        orderDir:'asc'
    }, isEnd = false, canScrolling = false;
	var v = 6;
    var myScroll;

    init();
    
    function init(){
        Foot.addFoot(2);
        base.showLoading()
    	$("#search .searchText").val(searchVal)
    	getPageLeaseProduct()
        
        addListener();
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
                    $("#content").html('<li class="no-data">暂无相关租赁产品</li>')
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
        
		$("#search .searchIcon").click(function(){
			location.href = './lease-list.html?searchVal='+$("#search .searchText").val()
		})
		
		
    }
});
