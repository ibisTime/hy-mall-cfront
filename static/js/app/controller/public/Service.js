define([
    'app/controller/base',
    'app/interface/GeneralCtr'
], function(base, GeneralCtr) {
    init();

	function init(){
        base.showLoading();
		GeneralCtr.getPageUserSysConfig()
			.then(function(data){
                base.hideLoading();
                data.list.forEach((item) => {
                    if(item.ckey == "custom_center") {
                    	$("#description").html(item.cvalue);
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
