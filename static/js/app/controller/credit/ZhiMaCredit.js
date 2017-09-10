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
		getZhiMaCredit();
    	addListener()
	}
	
	function getZhiMaCredit(param){
		UserCtr.getZhiMaCredit().then((data)=>{
			base.hideLoading();
			$(".zmCredit .zmCreditScore").html(data.zmScore)
			if(data.zmScore>650){
				$(".zmCredit .txt").html('当前可免押租赁')
			}else{
				$(".zmCredit .txt").html('当前芝麻分过低不可免押租赁')
			}
		})
	}

	function addListener(){
		
  	}

});