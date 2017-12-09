define([
    'app/controller/base',
    'app/interface/ActivityStr',
    'app/interface/MallCtr',
    'app/interface/LeaseCtr',
], function(base, ActivityStr, MallCtr, LeaseCtr) {
	var type = base.getUrlParam("type");//type=1，直接报名； type=2，选择装备后报名； 
	
    init();

	function init(){
		//有选择装备
		if(type==2){
			$("#chooseMall").removeClass("hidden")
			$("#chooseLease").removeClass("hidden")
			$("#chooseAddress").removeClass("hidden")
		}
		
		addListener()
	}
	
	function addListener(){
		
	}
})
