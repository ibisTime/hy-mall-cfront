define([
    'app/controller/base',
    'app/module/foot',
    'app/module/scroll',
    'app/util/handlebarsHelpers',
    'app/interface/LeaseCtr',
    'app/interface/GeneralCtr',
], function(base, Foot, scroll, Handlebars, LeaseCtr, GeneralCtr) {
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
                    $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无"'+searchVal+'"相关商品</p></div>')
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
