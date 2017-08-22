var SYSTEM_CODE = "CD-ZWZJ000012";
var PIC_PREFIX = 'http://otomdv0mr.bkt.clouddn.com/';

(function() {
  // 判断是否登录
  if (!/\/redirect\.html/.test(location.href)) {
    var arr,
      reg = new RegExp(
        "(^| )userId=([^;]*)(;|$)"),
      userId,
      userReferee = "";
    if (arr = document.cookie.match(reg))
      userId = unescape(arr[2]);

    // 未登录
    if (!userId) {
      var reg = new RegExp(
        "(^|&)userReferee=([^&]*)(&|$)(^|&)userReferee=([^&" +
        "]*)(&|$)(^|&)userReferee=([^&]*)(&|$)",
        "i");
      var r = window.location.search.substr(1).match(
        reg);
      if (r != null)
        userReferee = decodeURIComponent(r[2]);
      sessionStorage.setItem("userReferee",
        userReferee);
      sessionStorage.setItem("l-return",
        location.pathname + location.search);
      location.replace("../user/redirect.html");
    }
  }
})()
