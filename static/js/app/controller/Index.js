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
        limit: 5,
        location: '1',
        orderColumn:'order_no',
        orderDir:'asc'
    };

    init();
    
    function init(){
        Foot.addFoot(0);
        
        $.when(
        	getBanner(),
        	getNotice(),
        	getPageProduct(),
        	getPageLeaseProduct()
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

    //公告
    function getNotice(){
    	return GeneralCtr.getPageSysNotice({
            start: 1,
            limit: 1
        }).then(function(data){
			if(data.list.length){
				$("#noticeWrap").html(`
                    <a href="../public/notice.html" class="am-flexbox am-flexbox-justify-between">
                        <div class="am-flexbox am-flexbox-item">
                            <img src="/static/images/notice.png" alt="">
                            <span class="am-flexbox-item t-3dot">${data.list[0].smsTitle}</span>
                        </div>
                        <i class="right-arrow"></i>
                    </a>`);
			}
    	});
    }
    
    //获取推荐商品
    function getPageProduct(){
    	MallCtr.getPageProduct(config, true)
            .then(function(data) {
                base.hideLoading();
                var lists = data.list;
    			if(lists.length) {
    				
                    $("#mallContent").append(_proTmpl({items: lists}));
    			} else{
                    $("#mallContent").html('<li class="no-data">暂无推荐商品</li>')
                }
        	}, base.hideLoading);
	}
	
	//分页获取推荐的租赁商品
    function getPageLeaseProduct(){
    	LeaseCtr.getPageLeaseProduct(config, true)
            .then(function(data) {
                base.hideLoading();
                var lists = data.list;
    			if(lists.length) {
    				
                    $("#leaseContent").append(_leaseTmpl({items: lists}));
    			} else{
                    $("#leaseContent").html('<li class="no-data">暂无推荐租赁</li>')
                }
        	}, base.hideLoading);
	}
    
    function addListener(){
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
        //收藏
		$("#mallContent").on('click', '.mall-item .collect',function(){
			
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
		
		//收藏
		$("#leaseContent").on('click', '.lease-item .collect',function(){
			
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
