var SYSTEM_CODE = "CD-CHW000015";
var PIC_PREFIX = 'http://'+getCookie('qiniuUrl');
var PIC_SHOW = '?imageMogr2/auto-orient/interlace/1';
var JFPRODUCTTYPE = 'J01';
var JFLEASEPRODUCTTYPE = 'J04';
var SYS_USER = 'SYS_USER_HW';
var SYS_USERNAME = '邮寄发货';
//商城尺码排序
var MALLSIZE = {"XS":["1"],"S":["2"],"M":["3"],"L":["4"],"XL":["5"],"XXL":["6"],"XXXL":["7"]}

//分享域名
var SHARE_URL = "http://user.renbeihw.com/";
//领队微信端地址
var LEADER_URL = "http://wxld.renbeihw.com";

//我的页面  是否展示租赁订单  1 展示  0 不展示
var USER_LEASE_ISHIDDEN = '1';

(function() {
// 判断是否登录
//if (!/\/redirect\.html/.test(location.href)) {
//  var arr,
//    reg = new RegExp(
//      "(^| )userId=([^;]*)(;|$)");
//      
//	// share 推荐
//	// sLRfee，proCode推客
//  var userId,
//    share = "",
//    sLRfee = "",
//    proCode = "";
//  if (arr = document.cookie.match(reg))
//    userId = unescape(arr[2]);
//	
//	// 推荐分享
//	var regShare = new RegExp("(^|&)share=([^&]*)(&|$)", "i");
//	var rShare = window.location.search.substr(1).match(regShare);
//	// 推客分享
//	var regSLRfee = new RegExp("(^|&)sLRfee=([^&]*)(&|$)", "i"); // 推客userId
//	var regProCode = new RegExp("(^|&)code=([^&]*)(&|$)", "i"); // 商品code
//	var rSLRfee = window.location.search.substr(1).match(regSLRfee);
//	var rProCode = window.location.search.substr(1).match(regProCode);
//	if (rShare != null){
//		share = decodeURIComponent(rShare[2]);
//	}
//	if (rSLRfee != null && rProCode != null){
//		sLRfee = decodeURIComponent(rSLRfee[2]);
//		proCode = decodeURIComponent(rProCode[2]);
//	}
//  // 未登录
//  if (!userId) {
//  	var regIsRock = new RegExp("(^|&)isRock=([^&]*)(&|$)", "i");
//  	
//    	if(window.location.search.substr(1).match(regIsRock)!=null){
//    		
//    	}else{
//  		sessionStorage.setItem("share", share);
//  		sessionStorage.setItem("sLRfee", sLRfee);
//  		sessionStorage.setItem("proCode", proCode);
//	    	sessionStorage.setItem("l-return", location.pathname + location.search);
//	    	location.replace("../user/redirect.html");
//    	}
//  } else {
//  	if(sessionStorage.getItem("share")){
//  		location.replace("../public/WeChatOA.html");
//  		sessionStorage.removeItem("share");
//  	} else if(sessionStorage.getItem("sLRfee") && sessionStorage.getItem("proCode")){
//  		location.replace("../mall/mallDetail.html?code="+sessionStorage.getItem("proCode")+'&sLRfee='+sessionStorage.getItem("sLRfee"));
//  		sessionStorage.removeItem("proCode");
//  		sessionStorage.removeItem("sLRfee");
//  	}
//  }
//  
//}
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
