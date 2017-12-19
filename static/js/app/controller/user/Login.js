define([
    'app/controller/base',
    'app/module/validate',
	'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/util/cookie',
], function(base, Validate, GeneralCtr, UserCtr, CookieUtil) {
	
	var loginFalg = CookieUtil.get("loginFalg")&&CookieUtil.get("loginFalg")=='1'? true : false;//true 记住账号密码 
    var timer;

    init();

    function init(){
    	if(loginFalg){
    		$(".rememberInfo").addClass('active')
    		
        	if(CookieUtil.get("mobile")){
        		$("#loginName").val(CookieUtil.get("mobile")||'');
        		$("#loginPwd").val(CookieUtil.get("pwd")||'');
        	}
    	}else{
    		$(".rememberInfo").removeClass('active')
            CookieUtil.del("mobile");
            CookieUtil.del("pwd");
    	}
    	addListener();
    }

    function addListener(){
        var _formWrapper = $("#formWrapper");
        _formWrapper.validate({
            'rules': {
                loginName: {
                    required: true,
                    mobile: true
                },
                loginPwd: {
                    required: true,
                    maxlength: 16,
                    minlength: 6,
                    isNotFace: true
                }
            },
            onkeyup: false
        });
        $("#loginBtn").on("click", function() {
            if(_formWrapper.valid()){
            	
        		if(loginFalg){
		            CookieUtil.set("mobile", $("#loginName").val());
		            CookieUtil.set("pwd", $("#loginPwd").val());
        		}
            	$.when(
            		login(_formWrapper.serializeObject()),
	      			getQiniuUrl()
            	)
                
            }
        });
        
        $(".rememberInfo").click(function(){
        	
        	var loginName = $("#loginName").val();
        	var loginPwd = $("#loginPwd").val();
        	
        	if($(this).hasClass('active')){
        		loginFalg = false;
        		$(this).removeClass('active');
        		
        		CookieUtil.set("loginFalg", '0')
        		
	            CookieUtil.del("mobile");
	            CookieUtil.del("pwd");
        	}else{
        		loginFalg = true;
        		$(this).addClass('active')
        		
        		CookieUtil.set("loginFalg", '1')
        		
	            CookieUtil.set("mobile", loginName);
	            CookieUtil.set("pwd", loginPwd);
        	}
        })
    }
	//获取七牛地址
	function getQiniuUrl(){
		GeneralCtr.getUserSysConfig('qiniu_domain').then(function(data) {
	        base.setSessionQiniuUrl(data.cvalue+'/');
	    });
	}
    function login(param) {
        base.showLoading("登录中...");
        UserCtr.login(param)
            .then((data) => {
                base.hideLoading();
                base.setSessionUser(data);
                location.href = "../index.html";
            });
    }
});
