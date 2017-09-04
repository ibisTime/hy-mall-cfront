define([
  'app/controller/base',
  'app/module/foot',
  'app/interface/UserCtr',
  'app/interface/AccountCtr'
], function(base, Foot, UserCtr, AccountCtr) {
  const SUFFIX =
    "?imageMogr2/auto-orient/thumbnail/!200x200r";
  init();

  function init() {
    Foot.addFoot(3);
    base.showLoading("加载中...", 1);
    $.when(
      getUserInfo(),
      getAccount()
    ).then(base.hideLoading);
    
	   $("#logout").click(function() {
	       base.clearSessionUser();
	       location.href='./redirect.html'
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
            
          }
        })
      });
  }
  // 获取用户信息
  function getUserInfo() {
    return UserCtr.getUser().then(function(
      data) {
      $("#nickname").text(data.nickname);
      $("#userImg").attr("src", base.getAvatar(data.photo));
      $("#mobile").text(data.mobile);
      $("#invitation").attr('href','../invitation/invitation.html?userReferee='+data.mobile)
    });
  }
});
