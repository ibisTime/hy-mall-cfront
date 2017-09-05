define([
    'app/controller/base',
    'app/module/foot',
    'swiper',
    'app/util/handlebarsHelpers',
    'app/interface/GeneralCtr',
    'app/interface/MallCtr',
], function(base, Foot, Swiper, Handlebars, GeneralCtr, MallCtr) {
    var _proTmpl = __inline('../ui/mall-list-item.handlebars');
    var config = {
        start: 1,
        limit: 5,
        location: '1'
    };

    init();
    
    function init(){
        Foot.addFoot(0);
        
        $.when(
        	getBanner(),
        	getNotice(),
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
    			} else if(config.start == 1) {
                    $("#mallContent").html('<li class="no-data">暂无推荐商品</li>')
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
        
        $(".home-content").click(function(){
        	$(this).children('.hot-content').toggleClass('hidden')
        })
    }
});
