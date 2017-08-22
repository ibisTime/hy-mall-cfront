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
                    if(item.ckey == "aboutus") {
                    	$("#description").html(item.note);
                        weixin.initShare({
                            title: document.title,
                            desc: base.clearTag(item.note),
                            link: location.href,
                            imgUrl: base.getShareImg()
                        });
                    } else if(item.ckey == "telephone") {
                        $("#tel").text(item.note);
                    } else if(item.ckey == "serviceTime") {
                        $("#time").text(item.note);
                    }
                });
			});
	}
})
