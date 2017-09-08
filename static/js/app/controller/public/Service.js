define([
    'app/controller/base',
    'app/module/weixin',
    'app/interface/GeneralCtr'
], function(base, weixin, GeneralCtr) {
    init();

	function init(){
        base.showLoading();
		GeneralCtr.getPageUserSysConfig()
			.then(function(data){
                base.hideLoading();
                data.list.forEach((item) => {
                    if(item.ckey == "custom_center") {
                    	$("#description").html(item.cvalue);
                        weixin.initShare({
                            title: document.title,
                            desc: base.clearTag(item.cvalue),
                            link: location.href,
                            imgUrl: base.getShareImg()
                        });
                    } else if(item.ckey == "telephone") {
                        $("#tel span").text(item.cvalue);
                        $("#tel").attr('href','tel://'+item.cvalue)
                    } else if(item.ckey == "time") {
                        $("#time span").text(item.cvalue);
                    }
                });
			});
	}
})
