define([
    'app/controller/base',
    'app/module/foot',
    'app/util/handlebarsHelpers'
], function(base, Foot, Handlebars) {
    var _navTmpl = __inline('../../ui/category-item.handlebars');
    var _proTmpl = __inline('../../ui/mall-list-item.handlebars');
    var config = {
        start: 1,
        limit: 5
    }, isEnd = false, canScrolling = false;
    
    init();

	function init(){
        Foot.addFoot(1);
        base.showLoading();
        
        $.when(
        	getPageCategory(),
        	getPageProduct()
        )
        
        addListener()
	}
	
	//获取导航
	function getPageCategory(){
		var data = [{},{},{},{},{}]
        $(".mall-category").append(_navTmpl({items: data}));
        
        base.hideLoading();
	}
	
	function getPageProduct(refresh){
//  	GeneralCtr.getPageSysNotice(config, refresh)
//          .then(function(data) {
                base.hideLoading();
                var lists = [{},{},{},{},{}];
                var totalCount = 5;//+lists.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                }
    			if(lists.length) {
                    $("#content").append(_proTmpl({items: lists}));
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
    			} else if(config.start == 1) {
                    $("#content").html('<li class="no-data">暂无商品</li>')
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                canScrolling = true;
//      	}, hideLoading);
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
	}
	
})
