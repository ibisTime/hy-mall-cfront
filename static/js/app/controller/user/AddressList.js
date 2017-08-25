define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
    'Handlebars',
    'app/interface/UserCtr',
    'app/module/addOrEditAddress',
], function (base, Ajax, dialog, Handlebars, UserCtr, addOrEditAddress) {
	var code = base.getUrlParam("c") || '',
        returnUrl = sessionStorage.getItem("returnhref"),
        contentTmpl = __inline("../../ui/address-items.handlebars");
    var returnStatus = base.getUrlParam("return");
    
	init();
   
	function init(){
		
    	base.showLoading("加载中...", 1);
    	
    	getAddressList();
    	addListener()
	}
	
	//收货地址列表
	function getAddressList(){
		 UserCtr.getAddressList()
        .then(function(data){
            var html = "";
            if(data.length){
            	var html = contentTmpl({items: data});
            	$("#content").append(html);
            		
        		data.forEach(function(v, i){
        			if(v.isDefault == 1){
        				$("#content").find(".z_index0").eq(i).children("div").children(".radio-tip").addClass("active")
        			}
        		})
        	
            	$("footer").removeClass("hidden");
            	$("#loadAll").removeClass("hidden");
            }else{
                doError("#content");
            }
            
        	base.hideLoading();
        });
	}
	
	function addListener(){
		addOrEditAddress.addCont({
            userId: base.getUserId(),
            success: function() {
                getAddressList();
            }
        });
		
		$("#addBtn").click(function(){
			addOrEditAddress.showCont();
		})
	}
	
    function doError(cc) {
        $(cc).replaceWith('<div style="text-align: center;line-height: 3;">暂无数据</div>');
    }
});
