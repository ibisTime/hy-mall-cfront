define([
    'app/controller/base',
    'app/module/weixin',
    'app/interface/GeneralCtr'
], function(base, weixin, GeneralCtr) {

    init();
    
    function init(){
    	addListener()
        weixin.initShare({
            title: document.title,
            desc: "户外电商",
            link: location.href,
            imgUrl: base.getShareImg()
        });
    }
    
    function addListener(){
    	
    	$("#invitationShare").click(function(){
    		$("#mask").removeClass('hidden')
    	})
    	
    	$("#mask").click(function(){
    		$("#mask").addClass('hidden')
    	})
    }
});
