define([
    'app/controller/base',
    'app/module/foot',
    'app/module/weixin'
], function(base, Foot, weixin) {
	
    init();

	function init(){
        Foot.addFoot(0);
        
        addListener();
        
	}
	
	function addListener(){
		
	}
})