define([
    'app/controller/base',
    'app/interface/GeneralCtr'
], function(base, GeneralCtr) {
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
