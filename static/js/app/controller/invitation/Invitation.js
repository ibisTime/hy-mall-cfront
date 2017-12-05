define([
    'app/controller/base',
    'app/module/weixin',
    'app/interface/GeneralCtr'
], function(base, weixin, GeneralCtr) {
	var userReferee = base.getUrlParam('userReferee')

    init();
    
    function init(){
    	addListener()
    	
    	getUserSysConfig()
    	
        weixin.initShare({
            title: document.title,
            desc: "户外电商",
            link: SHARE_URL+'/public/WeChatOA.html',
            imgUrl: base.getShareImg()
        });
        
    }
    
	//推荐活动说明
	function getUserSysConfig(){
		GeneralCtr.getUserSysConfig('userref_rule', true).then((data)=>{
			$(".content").html(data.cvalue)
		})
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
