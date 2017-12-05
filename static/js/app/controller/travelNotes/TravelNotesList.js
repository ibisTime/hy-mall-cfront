define([
    'app/controller/base',
    'app/module/foot',
], function(base, Foot) {
	
    init();

	function init(){
        Foot.addFoot(0);
        
        addListener();
	}
	
	function addListener(){
		
	}
})
