define([
    'app/controller/base',
    'app/module/foot',
    'app/util/handlebarsHelpers',
    'app/interface/MallCtr',
], function(base, Foot, Handlebars, MallCtr) {
    var _navTmpl = __inline('../../ui/category-item.handlebars');
    var _proTmpl = __inline('../../ui/mall-list-item.handlebars');
    var config = {
        start: 1,
        limit: 10,
        orderColumn:'order_no',
        orderDir:'asc'
    }, isEnd = false, canScrolling = false;
    
    init();

	function init(){
        Foot.addFoot(1);
        base.showLoading();
        
        $.when(
        	getListCategory(),
        	getPageProduct(),
        	getPageCarProduct()
        )
        
        addListener()
	}
	
	//获取导航
	function getListCategory(){
		MallCtr.getListCategory(1,true).then((data)=>{
        	$(".mall-category").append(_navTmpl({items: data}));
		},()=>{})
        base.hideLoading();
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
    				
                    $("#content").append(_proTmpl({items: lists}));
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
    			} else if(config.start == 1) {
                    $("#content").html('<li class="no-data">暂无商品</li>')
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                canScrolling = true;
        	}, base.hideLoading);
	}
	
	function getPageCarProduct(){
		MallCtr.getPageCarProduct({
	        start: 1,
	        limit: 1,
		}).then((data)=>{
			
			if(data.list.length){
				$(".mallfloatWrap .shoppingCar").addClass('active')
			}
		})
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
