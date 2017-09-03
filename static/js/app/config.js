var SYSTEM_CODE = "CD-CHW000015";
var PIC_PREFIX = 'http://'+getCookie('qiniuUrl');
var PIC_SHOW = '?imageMogr2/auto-orient/interlace/1';
var JFPRODUCTTYPE = 'J01';
var SYS_USER = 'SYS_USER_HW';
var SYS_USERNAME = '快递到付';

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

function getCookie(cname)
{
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) 
  {
    var c = ca[i].trim();
    if (c.indexOf(name)==0) return c.substring(name.length,c.length);
  }
  return "";
}
