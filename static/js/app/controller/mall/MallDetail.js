define([
    'app/controller/base',
    'swiper',
], function(base, Swiper) {
    init();

	function init(){
        addListener();
	}
	
	function getProductDetail(){
		var dpic = data.pic;
        
        var strs= []; //定义一数组 
		var html="";
		strs=dpic.split("||"); //字符分割
		
		if(strs.length>1){
			for (i=0;i<strs.length ;i++ ) { 
				html+='<div class="swiper-slide"><img class="wp100" src="' + base.getImg(strs[i], 1) + '"></div>';
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
