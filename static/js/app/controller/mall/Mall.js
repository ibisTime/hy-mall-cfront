define([
    'app/controller/base',
    'app/module/foot',
    'app/util/handlebarsHelpers',
    'app/interface/MallCtr',
    'app/interface/GeneralCtr',
], function(base, Foot, Handlebars, MallCtr, GeneralCtr) {
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
        
		$("#goTop").click(()=>{
			var speed=200;//滑动的速度
	        $('body,html').animate({ scrollTop: 0 }, speed);
	        return false;
		})
		
		$("#search .searchText").focus(function(){
    		$(document).keyup(function(event){
				if(event.keyCode==13){
					if($("#search .searchText").val()&&$("#search .searchText").val()!=''){
						location.href = './mall-list.html?searchVal='+$("#search .searchText").val()
					}
				}
			}); 
    	})
    	$("#search .searchText").blur(function(){
			if (window.event.keyCode==13) window.event.keyCode=0 ;
    	})
    	
		
		//收藏
		$("#content").on('click', '.mall-item .collect',function(){
			
			base.showLoading();
			if($(this).hasClass('active')){
				//取消收藏
				GeneralCtr.cancelCollecte($(this).attr('data-code'),'P').then(()=>{
					$(this).removeClass('active')
					base.hideLoading();
					base.showMsg('取消成功')
				},()=>{
					base.hideLoading();
				})		
			}else{
				
				//收藏
				GeneralCtr.addCollecte($(this).attr('data-code'),'P').then(()=>{
					$(this).addClass('active')
					base.hideLoading();
					base.showMsg('收藏成功')
				},()=>{
					base.hideLoading();
				})	
			}
		})
		
	}
	
})
