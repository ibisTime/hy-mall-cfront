define([
    'app/controller/base',
  	'app/module/validate',
  	'app/interface/UserCtr',
], function(base, Validate, UserCtr) {
	
	init();
	
	function init(){
		
    	addListener()
	}
	
	function getZhiMaCreditAccreditUrl(param){
		base.showLoading()
		UserCtr.getZhiMaCreditAccreditUrl(param).then((data)=>{
			location.href = data.invokeUrl
		})
	}

	function addListener(){
		$("#zmCredit-form").validate({
			'rules': {
                "realName": {
                    required: true
                },
                "idNo": {
                    required: true,
                    isIdCardNo: true
                }
            },
            onkeyup: false
		})
		$("#subBtn").click(function(){
			if($("#zmCredit-form").valid()){
				var param = $("#zmCredit-form").serializeObject()
				getZhiMaCreditAccreditUrl(param)
			}
		})
  	}

});