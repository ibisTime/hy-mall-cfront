define([
    'app/controller/base',
    'app/module/weixin',
], function(base, weixin) {
    init();

	function init(){
		//微信分享
        weixin.initShare({
            title: '关注任贝电商',
            desc: '关注任贝电商',
            link: location.href,
            imgUrl: SHARE_URL+'/static/images/公众号二维码.jpg'
        });
	}
})
