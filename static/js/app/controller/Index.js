define([
    'app/controller/base',
    'app/module/foot',
    'swiper',
    'app/util/handlebarsHelpers',
    'app/interface/GeneralCtr',
    'app/interface/MallCtr',
    'app/interface/LeaseCtr',
], function(base, Foot, Swiper, Handlebars, GeneralCtr, MallCtr, LeaseCtr) {
    var _proTmpl = __inline('../ui/mall-list-item.handlebars');
    var _leaseTmpl = __inline('../ui/lease-list-item.handlebars');
    var config = {
        start: 1,
        limit: 10,
        location: '1',
        orderColumn:'order_no',
        orderDir:'asc'
    }, isEnd = false, canScrolling = false;
    
    var contentType = 1;//1推荐租赁，2推荐商品

    init();
    
    function init(){
        Foot.addFoot(0);
        
        $.when(
        	getBanner(),
        	getPageInformation(),
        	getPageProduct()
        )
        
        addListener()
    }
    
    //banner图
    function getBanner(){
        return GeneralCtr.getBanner()
            .then(function(data){
                if(data.length){
                    var html = "";
                    data.forEach(function(item){
                        html += `<div class="swiper-slide"><div data-url="${item.url}" class="banner-img" style="background-image: url('${base.getImg(item.pic)}')"></div></div>`;
                    });
                    if(data.length <= 1){
                        $(".swiper-pagination").addClass("hidden");
                    }
                    $("#top-swiper").html(html);
                    new Swiper('#swiper-container', {
                        'direction': 'horizontal',
                        'loop': data.length > 1,
                        'autoplay': 4000,
    		            'autoplayDisableOnInteraction': false,
                        // 如果需要分页器
                        'pagination': '.swiper-pagination'
                    });
                }
            });
    }
    
    //分页获取资讯
	function getPageInformation(refresh) {
		return GeneralCtr.getPageInformation({
	        start: 1,
	        limit: 5,
	        status:1
		}, refresh)
		.then(function(data) {
			if(data.list.length){
				var html = '';
				data.list.forEach(function(d, i){
					html += `<div class="t-3dot">${d.title}</div>`
				})
				
				$("#noticeWrap .notice-list-wrap1").html(html);
				
				if(data.list.length>1){
					
					var noticeList = $('.notice-list')[0];
			        var noticeList_1 = $('.notice-list-wrap1')[0];
			        var noticeList_2 = $('.notice-list-wrap2')[0];
			        var noticeLiH = noticeList_1.scrollHeight/data.list.length;
			        noticeList.scrollTop = 0;
			        
			        // 克隆
			        noticeList_2.innerHTML = noticeList_1.innerHTML;
			        
	                var setMove1, setMove2;
	                
                	setMove1 = setInterval(function(){
                		if (noticeList.scrollTop >= noticeList_1.scrollHeight) {
	                        noticeList.scrollTop = 0;
	                    } else {
	                    	
	                		var tmplH =0;
	                        setMove2 = setInterval(function(){
		                		if (tmplH >= noticeLiH) {
			                    	clearInterval(setMove2);
			                    }else{
			                        noticeList.scrollTop += 1;
			                        tmplH += 1;
			                    }
		                		
			                }, 50);
	                    }
	                }, 2000);
	                
				}
				
			}else{
				
				$("#noticeWrap .notice-list").html('<span class="am-flexbox-item t-3dot pl30">暂无资讯</span>');
			}
		}, base.hideLoading);
	}

    //获取首页推荐商品
    function getPageProduct(){
    	//contentType=1,租赁商品  contentType=2,商品
    	
    	if(contentType==2){
    		//分页获取推荐商品
	    	MallCtr.getPageProduct(config, true)
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
	                    $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无推荐商品</p></div>')
	                } else {
	                    $("#loadAll").removeClass("hidden");
	                }
	                canScrolling = true;
	        	}, base.hideLoading);
    	}else{
    		//分页获取推荐的租赁商品
    		LeaseCtr.getPageLeaseProduct(config, true)
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
                    $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无推荐租赁</p></div>')
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                canScrolling = true;
        	}, base.hideLoading);
    	}
	}
    
    function addListener(){
    	$(window).off("scroll").on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                base.showLoading();
                getPageProduct();
            }
        });
    	
        $("#swiper-container").on("touchstart", ".swiper-slide div", function (e) {
            var touches = e.originalEvent.targetTouches[0],
                me = $(this);
            me.data("x", touches.clientX);
        });
        $("#swiper-container").on("touchend", ".swiper-slide div", function (e) {
            var me = $(this),
                touches = e.originalEvent.changedTouches[0],
                ex = touches.clientX,
                xx = parseInt(me.data("x")) - ex;
            if(Math.abs(xx) < 6){
                var url = me.attr('data-url');
                if(url){
                	if(!/^http/i.test(url)){
                		location.href = "http://"+url;
                	}else{
                		location.href = url;
                	}
                }

            }
        });
        
        //推荐标题点击
        $("#hotTitle .title").click(function(){
        	config = {
		        start: 1,
		        limit: 10,
		        location: '1',
		        orderColumn:'order_no',
		        orderDir:'asc'
		    },isEnd = false, canScrolling = false;
		    
        	$(this).addClass('active').siblings().removeClass('active')
        	contentType = $(this).attr('data-contentType');
        	
        	$("#content").empty();
        	
        	base.showLoading();
        	getPageProduct();
        })
        
        //商品收藏
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
		
		//租赁收藏
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
		
		//返回顶部
        $("#goTop").click(()=>{
            var speed=200;//滑动的速度
            $('body,html').animate({ scrollTop: 0 }, speed);
            return false;
        })

    }
});
