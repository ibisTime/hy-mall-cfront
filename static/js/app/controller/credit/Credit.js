define([
    'app/controller/base',
	'app/module/foot',
  	'app/interface/UserCtr',
], function(base, Foot, UserCtr) {
	
	init();
	
	function init(){
		base.showLoading()
    	Foot.addFoot(3);
    	$.when(
    		getUserInfo(),
    		getStuCreditDetail()
    	)
    	addListener()
	}
	
	function getUserInfo() {
	    UserCtr.getUser().then((data)=> {
	    	base.hideLoading();
	    	if(data.zmScore){
				$("#isZmAccredit").attr('href','../credit/zhiMaCredit.html')
			}else{
				$("#isZmAccredit").attr('href','../credit/zhiMaCreditAccredit.html')
			}
	    });
	}
	
	function getStuCreditDetail(){
		UserCtr.getCreditDetail('student').then((data)=>{
			if(data.authArg1){
				
				$("#isStuAccredit").attr('href','../credit/studentCredit.html')
			}else{
				
				$("#isStuAccredit").attr('href','../credit/studentCreditAccredit.html')
			}
		})
	}
	
	function addListener(){
		
  	}

});