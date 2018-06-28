define([
  'app/controller/base',
  'app/module/judgeBindMobile',
  'app/module/bindMobileSms',
  'app/interface/GeneralCtr',
  'app/interface/UserCtr'
], function(base, JudgeBindMobile, BindMobileSms, GeneralCtr, UserCtr) {
	var share = sessionStorage.getItem("share") || "";
	var sLRfee = sessionStorage.getItem("sLRfee") || "";
	var proCode = sessionStorage.getItem("proCode") || "";

	init();

  function init() {
    var code = base.getUrlParam("code");
    if (!base.isLogin()) { // 未登录
      if (!code) {
        base.showLoading();
        getAppID();
        return;
      }
      base.showLoading("登录中...");

      var param = {
	        code,
	        companyCode: SYSTEM_CODE
	      }
//    base.hideLoading()
//    base.showMsg(code,100000)
      $.when(
      	wxLogin(param),
	      getQiniuUrl()
      )

    } else { // 已登陆
      location.href = "../index.html";
    }
  }
  // 获取appId并跳转到微信登录页面
  function getAppID() {
    GeneralCtr.getAppId()
      .then(function(data) {
        base.hideLoading();
        if (data) {
          var appid = data.wx_h5_access_key;
          var redirect_uri = base.getDomain() + "/user/redirect.html";
          location.replace("https://open.weixin.qq.com/connect/oauth2/authorize?appid=" +
            appid + "&redirect_uri=" + redirect_uri +
            "&response_type=code&scope=snsapi_userinfo#wechat_redirect");
        } else {
          base.showMsg("非常抱歉，appId获取失败");
        }
      });
  }
  //获取七牛地址
  function getQiniuUrl(){
			GeneralCtr.getUserSysConfig('qiniu_domain').then(function(data) {
	        base.setSessionQiniuUrl(data.cvalue+'/');
	    });
  }

  // 微信登录
  function wxLogin(param) {
    UserCtr.wxLogin(param).then(function(data) {
      base.hideLoading();
        base.setSessionUser(data);
        var returnFistUrl = sessionStorage.getItem("l-return");
        if(share&&share=='1'){
        	base.gohrefReplace("../public/WeChatOA.html");
    			sessionStorage.removeItem("share");
        }else if (sLRfee && proCode) {
        	base.gohrefReplace("../mall/mallDetail.html?code="+proCode+'&sLRfee='+sLRfee);
	    		sessionStorage.removeItem("proCode");
	    		sessionStorage.removeItem("sLRfee");
        }else if (returnFistUrl) {
          base.gohrefReplace(returnFistUrl);
        } else {
          base.gohrefReplace("../index.html");
        }
    }, function() {
    	base.showMsg('登录失败');
    });
  }
});
