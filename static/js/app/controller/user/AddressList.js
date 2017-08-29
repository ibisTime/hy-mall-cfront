define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
    'app/interface/UserCtr',
    'app/module/addOrEditAddress',
], function (base, Ajax, dialog, UserCtr, addOrEditAddress) {
	var code = base.getUrlParam("c") || '',
        returnUrl = sessionStorage.getItem("returnhref");
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
            	var html = '';
            	
        		data.forEach(function(v, i){
        			html+=`<div class="addressWrap ${v.isDefault==1?'active':''}"><div class="addressWrap-detail wp100" data-code="${v.code}">
            		<div class="wp100 mb10"><span class="addressee">${v.addressee}</span>
	            	<span class="mobile">${v.mobile}</span></div><div class="wp100">
		            <span class="province">${v.province}</span>
		            <span class="city">${v.city}</span>
		            <span class="district">${v.district}</span>
		            <span class="detailAddress">${v.detailAddress}</span></div></div>
					<div class="operationWrap wp100"><div class="fl">
					<div class="iconWrap isDefaultBtn" data-code="${v.code}"><i class="icon icon-default"></i><p>${v.isDefault==1?'已设为默认':'设为默认'}</p></div></div>
					<div class="fr">
					<div class="fl mr20 iconWrap editBtn" data-code="${v.code}"><i class="icon icon-edit"></i><p>编辑</p></div>
					<div class="fl iconWrap deleteBtn" data-code="${v.code}"><i class="icon icon-delete"></i><p>删除</p></div>
					</div></div></div>`
        		})
        		
            	$("#content").html(html);
            	
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
		
		//新增
		$("#addBtn").click(function(){
			addOrEditAddress.showCont();
		})
		
		//修改
		$("#content").on("click", '.addressWrap .addressWrap-detail',function(){
			addOrEditAddress.showCont({
				code : $(this).attr('data-code')
			});
		})
		
		//设为默认
		$("#content").on("click", '.addressWrap .isDefaultBtn',function(){
			
			base.confirm("确定该地址为默认地址？").then(()=>{
	    		base.showLoading("设置中...", 1);
				setDefaultAddress($(this).attr('data-code'));
				
	        	base.hideLoading();
			},()=>{})
			
		})
		
		//编辑
		$("#content").on("click", '.addressWrap .editBtn',function(){
    		addOrEditAddress.showCont({
				code : $(this).attr('data-code')
			});
		})
		
		//删除
		$("#content").on("click", '.addressWrap .deleteBtn',function(){
			
			base.confirm("确认删除该地址？").then(()=>{
	    		base.showLoading("删除中...", 1);
				deleteAddress($(this).attr('data-code'));
        		base.hideLoading();
			},()=>{})
			
		})
		
	}
	
	//设置默认地址
	function setDefaultAddress(c){
		UserCtr.setDefaultAddress(c).then(()=>{
			location.reload(true);
		},()=>{},)
	}
	
	//删除地址
	function deleteAddress(c){
		UserCtr.deleteAddress(c).then(()=>{
			location.reload(true);
		},()=>{},)
	}
	
	//
    function doError(cc) {
        $(cc).replaceWith('<div style="text-align: center;line-height: 3;">暂无数据</div>');
    }
});
