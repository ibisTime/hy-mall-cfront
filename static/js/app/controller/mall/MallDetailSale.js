define([
    'app/controller/base',
    'swiper',
    'app/interface/MallCtr',
    'app/interface/GeneralCtr',
    'app/util/handlebarsHelpers',
    'app/module/weixin',
], function(base, Swiper, MallCtr, GeneralCtr, Handlebars, weixin) {
	var code = base.getUrlParam("code");
	
    init();
    
	function init(){
		base.showLoading();
        getProductDetail(code)
        addListener();
	}
	
	//获取商品详情
	function getProductDetail(c){
		MallCtr.getProductDetail(c).then((data)=>{
			
			var dpic = data.pic;
	        var strs= []; //定义一数组 
			var html="";
			strs=dpic.split("||"); //字符分割
			
			if(strs.length>1){
				strs.forEach(function(d, i){
					html+=`<div class="swiper-slide"><div class="mallDetail-img" style="background-image: url('${base.getImg(d,'?imageMogr2/auto-orient/thumbnail/!900x900')}')"></div></div>`;
				})
				$("#top-swiper").html(html);
				var mySwiper = new Swiper('#swiper-container', {
		            'paginationClickable' :true,
		            'preventClicksPropagation': true,
	                // 如果需要分页器
	                'pagination': '.swiper-pagination'
	            });
			}else{
				$("#top-swiper").html(`<div class="swiper-slide"><div class="mallDetail-img" style="background-image: url('${base.getImg(dpic,'?imageMogr2/auto-orient/thumbnail/!900x900')}')"></div></div>`);
			}
			
			$('title').html(data.name+'-商品详情');
			
			//微信分享
	        weixin.initShare({
	            title: data.name+'-商品详情',
	            desc: data.slogan,
	            link: location.href,
	            imgUrl: base.getImg(data.advPic)
	        });
			
			$(".mallDetail-title .name").html(data.name)
			$(".mallDetail-title .slogan").html(data.slogan)
			
			base.hideLoading();
		},()=>{})
	}
	
	function addListener(){
	}
	
	
})
