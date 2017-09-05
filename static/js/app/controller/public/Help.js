define([
    'app/controller/base',
    'app/module/weixin',
    'app/interface/GeneralCtr'
], function(base, weixin, GeneralCtr) {
    init();

	function init(){
        base.showLoading();
		GeneralCtr.getUserSysConfig('help_center')
			.then(function(data){
                base.hideLoading();
            	$("#description").html(data.cvalue);
			});
	}
})
