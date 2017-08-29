define([
    'app/controller/base',
    'swiper',
    'app/interface/MallCtr',
], function(base, Swiper, MallCtr) {
	var code = base.getUrlParam("code")
	
    init();

	function init(){
        addListener();
        getProductDetail(code);
	}
	
	//获取商品详情
	function getProductDetail(c){
		
		MallCtr.getProductDetail(c).then((data)=>{
			
			var dpic = data.pic;
	        var strs= []; //定义一数组 
			var html="";
			strs=dpic.split("||"); //字符分割
			
			if(strs.length>1){
				for (var i=0;i<strs.length ;i++ ) { 
					html+='<div class="swiper-slide"><div class="mallDetail-img" style="background-image: url('+ base.getImg(strs[i]) + '"></div></div>';
				}
				$("#top-swiper").html(html);
				var mySwiper = new Swiper('#swiper-container', {
	                'direction': 'horizontal',
	                'loop': true,
		            'autoplayDisableOnInteraction': false,
	                // 如果需要分页器
	                'pagination': '.swiper-pagination'
	            });
			}else{
				$("#top-swiper").html('<div class="swiper-slide"><img class="wp100" src="' + base.getImg(dpic, 1) + '"></div>');
			}
			
			$(".mallDetail-title .name").html(data.name)
			$(".mallDetail-title .slogan").html(data.slogan)
			$(".mallDetail-title .name").html(data.name)
			$(".mallDetail-title .name").html(data.name)
			$("#content").html(data.description)
			
		},()=>{})
	}
	
	function addListener(){
		var mySwiper = new Swiper('#swiper-container', {
            'direction': 'horizontal',
            'loop': false,
            'autoplayDisableOnInteraction': false,
            // 如果需要分页器
            'pagination': '.swiper-pagination'
        });
		
	}
	
	
})
