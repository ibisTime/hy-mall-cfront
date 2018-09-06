define([
    'app/controller/base',
    'swiper',
    'app/interface/MallCtr',
    'app/interface/UserCtr',
    'app/util/handlebarsHelpers',
    'app/module/weixin',
], function(base, Swiper, MallCtr, UserCtr, Handlebars, weixin) {
	var code = base.getUrlParam("code");
	var gCode = base.getUrlParam('gCode') || '';
	var userInfo = base.getUserInfo();
	
    init();
    
	function init(){
		base.showLoading();
        getProductDetail(code)
        addListener();
	}
	
	//获取商品详情 和 查询当前产品推荐奖励
	function getProductDetail(c){
		$.when(
			MallCtr.getProductDetail(c),
			MallCtr.getBackAmount(c),
			UserCtr.getUser()
		).then((data, backData, userData)=>{
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
			
			$(".mallDetail-title .name").html(data.name);
			$(".mallDetail-title .slogan").html(data.slogan);
			
			$(".userInfo").html(`
				<div class="photo" style="background-image: url('${base.getWXAvatar(userData.photo)}')"></div>
				<div class="nickname">我是${userData.nickname}</div>
				<div class="txt">为你推荐<samp id="goDetail">${data.name}</samp></div>`);
			
			if(backData.backMinAmount == backData.backMaxAmount){
				$(".backAmount-wrap .txt").html(`分销佣金每件<samp>${base.formatMoney(backData.backMinAmount)}</samp>元`)
			} else {
				$(".backAmount-wrap .txt").html(`分销佣金每件<samp>${base.formatMoney(backData.backMinAmount)} 至 ${base.formatMoney(backData.backMaxAmount)}</samp>元`)
			}
			
			//微信分享
	        weixin.initShare({
	            title: data.name+'-商品详情',
	            desc: data.slogan,
	            link: SHARE_URL+'mall/mallDetail.html?code='+code+'&sLRfee='+base.getUserId(),
	            imgUrl: base.getImg(data.advPic)
	        });
		
			base.hideLoading();
		},()=>{})
	}
	
	function addListener(){
    	$("#shareBtn").click(function(){
    		$("#mask").removeClass('hidden')
    	})
    	
    	$("#mask").click(function(){
    		$("#mask").addClass('hidden')
    	})
    	
    	$("#shareImgBtn").click(function(){
    		base.gohref("./mallDetail-imgShare.html?code="+code+'&gCode='+gCode);
    	})
    	
    	$(".userInfo").on("click", '#goDetail',function(){
    		base.gohref("../mall/mallDetail.html?sLRfee=" + base.getUserId()+"&code="+code+'&gCode='+gCode);
    	})
    	
	}
	
	
})
