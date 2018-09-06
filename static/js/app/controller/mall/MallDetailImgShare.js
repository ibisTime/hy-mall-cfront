define([
    'app/controller/base',
    'swiper',
    'app/interface/MallCtr',
    'app/interface/GeneralCtr',
    'app/module/weixin',
], function(base, Swiper, MallCtr, GeneralCtr, weixin) {
	var code = base.getUrlParam("code");
	var gCode = base.getUrlParam('gCode') || '';
	var userInfo = base.getUserInfo();
	
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
			
			if(strs.length >= 1){
				strs.forEach(function(d, i){
					html+=`<div class="img"><img src="${base.getImg(d,'?imageMogr2/auto-orient/thumbnail/!400x400')}" /></div>`;
				})
				html+=`<div class="qrcode" id="qrcode"></div>`
				$("#content").html(html);
				var href = SHARE_URL + "mall/mallDetail.html?sLRfee=" + base.getUserId()+"&code="+code+'&gCode='+gCode;
				var qrcode = new QRCode('qrcode', href);
			}
			
			$('title').html(data.name+'-商品详情');
			
			base.hideLoading();
		},()=>{})
	}
	
	function addListener(){
		$(".top-wrap").click(function(){
			if($(".top-wrap").hasClass("on")){
				$(".top-wrap").removeClass("on");
			} else {
				$(".top-wrap").addClass("on");
			}
		})
	}
	
	
})
