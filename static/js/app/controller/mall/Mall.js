define([
    'app/controller/base',
    'app/module/foot',
    'app/util/handlebarsHelpers',
    'app/interface/MallCtr',
    'app/interface/GeneralCtr',
], function(base, Foot, Handlebars, MallCtr, GeneralCtr) {
    var _navTmpl = __inline('../../ui/category-item.handlebars');
    var _proTmpl = __inline('../../ui/mall-list.handlebars');
    var config = {
        start: 1,
        limit: 10,
        location:"2",
        orderColumn:'order_no',
        orderDir:'asc'
    }, isEnd = false, canScrolling = false;
    
    init();

	function init(){
        Foot.addFoot(1);
        base.showLoading();
        
        $.when(
        	getBigCategoryPage(),
        	getPageProduct(),
        	getPageCarProduct()
        )
        
        addListener()
	}
	
	//获取导航
	function getBigCategoryPage(){
		MallCtr.getBigCategoryPage(true).then((data)=>{
        	$(".mall-category").append(_navTmpl({items: data.list}));
        	if(data.totalCount>12){
        		$(".mall-category .cate-item:last-child").remove();
        		$(".mall-category").append('<a href="./mall-list.html" class="cate-item"><div class="icon"><img src="/static/images/allCategory.png"></div><p>全部分类</p></a>')
        	}
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
                    $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无商品</p></div>')
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
        
        //搜索
		$("#search .searchText").focus(function(){
    		$(document).keyup(function(event){
				if(event.keyCode==13){
					if($("#search .searchText").val()&&$("#search .searchText").val()!=''){
						location.href = './mall-search.html?searchVal='+$("#search .searchText").val()
					}
				}
			}); 
    	})
    	$("#search .searchText").blur(function(){
			if (window.event.keyCode==13) window.event.keyCode=0 ;
    	})
    	
		//返回顶部
        $("#goTop").click(()=>{
            var speed=200;//滑动的速度
            $('body,html').animate({ scrollTop: 0 }, speed);
            return false;
        })
		
	}
	
})
