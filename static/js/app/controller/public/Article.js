define([
    'app/controller/base',
    'app/interface/GeneralCtr'
], function(base, GeneralCtr) {
	var type = base.getUrlParam('type')
    init();

	function init(){
        base.showLoading();
		GeneralCtr.getUserSysConfig(type)
			.then(function(data){
                base.hideLoading();
                $('title').html(data.remark)
            	$("#description").html(data.cvalue);
			});
	}
})
