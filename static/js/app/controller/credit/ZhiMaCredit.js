define([
    'app/controller/base',
	'app/module/foot',
  	'app/module/validate',
  	'app/interface/UserCtr',
], function(base, Foot, Validate, UserCtr) {
	
	init();
	
	function init(){
		base.showLoading()
    	Foot.addFoot(3);
    	
    	$.when(
    		getZhiMaCredit(),
    		getUserJmAmount()
    	).then(base.hideLoading(),base.hideLoading())
    	addListener()
	}
	
	function getUserJmAmount(){
		UserCtr.getUserJmAmount().then((data)=>{
			$(".zmCredit .txt").html('当前可免押金额为'+base.formatMoney(data.deductAmount)+'元')
		})
	}
	
	function getZhiMaCredit(){
		UserCtr.getZhiMaCredit().then((data)=>{
			$(".zmCredit .zmCreditScore").html(data.zmScore)
		})
	}

	function addListener(){
		
  	}

});