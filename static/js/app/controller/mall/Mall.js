define([
    'app/controller/base',
    'app/module/foot',
], function(base, Foot) {
    init();

	function init(){
        Foot.addFoot(1);
        addListener()
	}
	
	function addListener(){
		$("#goTop").click(()=>{
			var speed=200;//滑动的速度
	        $('body,html').animate({ scrollTop: 0 }, speed);
	        return false;
		})
	}
	
	
})
