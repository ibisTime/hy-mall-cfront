define([
  'app/controller/base',
  'app/module/judgeBindMobile',
  'app/module/bindMobileSms',
  'app/interface/GeneralCtr',
  'app/interface/UserCtr'
], function(base, JudgeBindMobile, BindMobileSms, GeneralCtr, UserCtr) {

  var mobile = base.getUrlParam("m");
  var smsCaptcha = base.getUrlParam("s");
  var userReferee = base.getUrlParam("userReferee");

  if (!userReferee) {
    userReferee = sessionStorage.getItem("userReferee") || "";
  } else {
    sessionStorage.setItem("userReferee", userReferee);
  }

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
      
      $.when(
      	wxLogin({
	        code,
	        mobile,
	        smsCaptcha,
	        userReferee,
	        companyCode: SYSTEM_CODE
	      }),
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
        if (data.length) {
          var appid = data[0].password;
          var redirect_uri = encodeURIComponent(base.getDomain() + "/user/redirect.html?m=" +
            mobile + "&s=" + smsCaptcha);
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
	        base.setSessionQiniuUrl('http://'+data.cvalue+'/');
	    });
  }
  
  // 微信登录
  function wxLogin(param) {
    UserCtr.wxLogin(param).then(function(data) {
      base.hideLoading();
      if (data.userId == null || data.userId == "") {
        JudgeBindMobile.addCont({
          success: function(resMobile, resSms) {
            mobile = resMobile;
            smsCaptcha = resSms;
            getAppID();
          }
        }).showCont();
      } else {
        base.setSessionUser(data);
        var returnFistUrl = sessionStorage.getItem("l-return");
        if (returnFistUrl) {
          sessionStorage.removeItem("l-return");
          location.href = returnFistUrl;
        } else {
          location.href = "../index.html"
        }
      }
    }, function() {
      setTimeout(function() {
        BindMobileSms.addMobileCont({
          mobile: param.mobile,
          success: function(resMobile, resSms) {
            mobile = resMobile;
            smsCaptcha = resSms;
            getAppID();
          },
          error: function(msg) {
            base.showMsg(msg);
          },
          hideBack: 1
        }).showMobileCont();
      }, 1000);
    });
  }
});
