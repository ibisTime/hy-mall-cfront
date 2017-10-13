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
            limit: 5
        }).then(function(data){
			if(data.list.length){
				var html = '';
				
				data.list.forEach(function(d, i){
					html += `<li class="am-flexbox-item t-3dot">${d.smsTitle}</li>`
				})
				
				$("#noticeWrap .notice-list-wrap1").html(html);
				
				if(data.list.length>1){
					
					var noticeList = $('.notice-list')[0];
			        var noticeList_1 = $('.notice-list-wrap1')[0];
			        var noticeList_2 = $('.notice-list-wrap2')[0];
			        noticeList.scrollTop = 0;
			        
			        var oBox=$('.notice-list');  
	    			var oLi=oBox.find('li');  
				    var iLi=[];  
				    var iHeight=null;  
				    var oTime=null;  
				    var nHeight=null;
				    var i=0,j=0;
			        
			        for(i=0;i<oLi.length;i++){  
				        iLi.push(-oLi[i].offsetHeight);  
				    }
			        
			        // 克隆
			        noticeList_2.innerHTML = noticeList_1.innerHTML;
			        
			        doMove();  
			        
				    function doMove(){  
				        clearInterval(oTime);  
				        oTime=setInterval(function(){  
				            nHeight+=iLi[j];  
				            if(oBox.offsetTop == -(oBox.offsetHeight/2)){  
				                oBox.style.top=0;  
				            }  
				            else{  
				                startMove(oBox,nHeight)  
				            }  
				            j++;  
				            if(j>iLi.length){  
				                j=1;  
				                nHeight=iLi[0];  
				                startMove(oBox,nHeight)  
				            }  
				  
				        },2000)  
				    }  
				}
				
			}else{
				
				$("#noticeWrap .notice-list").html('<span class="am-flexbox-item t-3dot">暂无公告</span>');
			}
    	});
    }
    
    function NoticeStartMove(nList){
    	clearInterval(nList.oTime); 
    	
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
