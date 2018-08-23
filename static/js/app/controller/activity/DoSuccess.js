define([
    'app/controller/base',
    'swiper',
    'app/module/weixin',
    'app/interface/GeneralCtr',
	'app/interface/UserCtr',
    'app/interface/ActivityStr',
    'app/module/bindMobile',
], function(base, Swiper, weixin, GeneralCtr, UserCtr, ActivityStr, BindMobile) {
	var code = base.getUrlParam("code");
	
    init();

	function init(){
		
		base.showLoading();
		getActivityDetail()
		addListener()
		
	}
	
	//获取详情
	function getActivityDetail(){
		return ActivityStr.getActivityDetail(code).then((data)=>{
			$('.wxGroupQrcode').html(`<img src="${base.getImg(data.wxGroupQrcode,'?imageMogr2/auto-orient/thumbnail/!1000x1000r')}">`)
			base.hideLoading()
		}, base.hideLoading)
	}
	
	function addListener(){
		
	}
})
