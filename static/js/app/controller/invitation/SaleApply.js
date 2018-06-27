define([
    'app/controller/base',
    'app/module/validate',
    'app/interface/UserCtr'
], function(base, Validate, UserCtr) {
	var code = base.getUrlParam('code') || '';

    init();
    
	var _formWrapper = $("#formWrapper");
    _formWrapper.validate({
        'rules': {
            realName: {
                required: true
            },
            mobile: {
                required: true,
                mobile: true
            }
        },
        onkeyup: false
    });
    
    function init(){
    	base.showLoading();
    	if(code){
    		$.when(
    			UserCtr.getUser(),
    			getDetailSale()
    		).then(function(data){
				if(data.mobile){
					$("#formWrapper .mobile-wrap .form-mask").removeClass("hidden");
				}
    		}, base.hideLoading)
    	} else {
			getUserInfo();
    	}
    	addListener();
    }
    
	 // 获取用户信息
	function getUserInfo() {
		return UserCtr.getUser().then(function(data) {
			_formWrapper.setForm(data);
			if(data.mobile){
				$("#formWrapper .mobile-wrap .form-mask").removeClass("hidden");
			}
			if(data.realName){
				$("#formWrapper .realName-wrap .form-mask").removeClass("hidden");
			}
			base.hideLoading();
		}, base.hideLoading);
	}
	
	// 获取推客申请详情
	function getDetailSale(){
		return UserCtr.getDetailSale(code).then(function(data) {
			base.hideLoading();
			_formWrapper.setForm(data);
		}, base.hideLoading);
	}
	
    function addListener(){
    	$("#subBtn").click(function(){
    		if(_formWrapper.valid()){
    			var params = _formWrapper.serializeObject();
    			base.showLoading();
    			if(code){
    				params.code = code;
    				UserCtr.applySaleAgain(params).then(function(data){
	    				base.hideLoading();
	    				base.showMsg("申请成功！请等待管理员审核");
	    				setTimeout(function(){
	            			base.gohref("../user/set.html")
	    				}, 1200)
	    			}, base.hideLoading)
    			} else {
	    			UserCtr.applySale(params).then(function(data){
	    				base.hideLoading();
	    				base.showMsg("申请成功！请等待管理员审核");
	    				setTimeout(function(){
	            			base.gohref("../user/set.html")
	    				}, 1200)
	    			}, base.hideLoading)
    			}
    		}
    	});
    }
});
