define([
  'app/controller/base',
  'app/module/foot',
  'app/interface/UserCtr',
  'app/interface/AccountCtr'
], function(base, Foot, UserCtr, AccountCtr) {
  const SUFFIX =
    "?imageMogr2/auto-orient/thumbnail/!200x200r";
    
  if(base.getUserId()){
    	
    	init();
    }else{
    	base.showMsg('登录失效')
    	setTimeout(function(){
    		base.clearSessionUser();
    		base.goLogin()
    	},800)
    }

  function init() {
    Foot.addFoot(3);
    base.showLoading("加载中...", 1);
    $.when(
      getUserInfo(),
      getAccount(),
      getUserJmAmount()
    ).then(base.hideLoading);
    
	   $("#logout").click(function() {
	       base.clearSessionUser();
	       location.href='./redirect.html'
	   });
	  	$("#goLeaderWX").click(function() {
	      location.href=LEADER_URL
	  	});
	   
  }
  
  // 获取账户信息
  function getAccount() {
    return AccountCtr.getAccount()
      .then(function(data) {
        data.forEach(function(d, i) {
          if (d.currency == "CNY") {
          	
            $("#cnyAmount").text(base.formatMoney(d.amount));
          } else if (d.currency == "JF") {
          	
            $("#jfAmount").text(base.formatMoney(d.amount));
          } else if (d.currency == "XJK") {
          	
            $("#XJKAmount").text(base.formatMoney(d.amount));
          }
        })
      });
  }
  
  function getUserJmAmount(){
  	UserCtr.getUserJmAmount().then(function(data) {
      $("#jmyjAmount").html('当前减免额度为'+base.formatMoney(data.deductAmount)+'元');
    });
  }
  
  // 获取用户信息
  function getUserInfo() {
    return UserCtr.getUser().then(function(data) {
      $("#nickname").text(data.nickname);
      $("#userImg").css({"background-image":"url('"+base.getAvatar(data.photo)+"')"});
      $("#invitation").attr('href','../invitation/invitation.html?userReferee='+data.mobile)
    });
  }
});
