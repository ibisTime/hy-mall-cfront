define([
    'app/controller/base',
    'app/module/AddressList',
    'app/interface/UserCtr',
    'app/module/bindMobile',
    'app/module/ActivityChooseMallList',
    'app/module/ActivityChooseLeaseList',
], function(base, AddressList, UserCtr, BindMobile, ActivityChooseMallList, ActivityChooseLeaseList) {
	var code = base.getUrlParam("code");
	var config = {
		productCode: code,
    	receiver: "",
        reMobile: "",
        reAddress: "",
	};
	var isBindMobile = false;//是否绑定手机号
    init();

	function init(){
		
		addListener()
	}
	
	//地址列表module
	function addressListAddCont(c){
		AddressList.addCont({
            userId: base.getUserId(),
            success: function(res,dCode) {
            	if(res.receiver){
            		config.receiver = res.receiver;
				    config.reMobile = res.reMobile;
				    config.reAddress = res.reAddress;
				    
					var html = `<div class="icon icon-dz"></div>
					<div class="wp100 over-hide"><samp class="fl addressee">收货人：${config.receiver}</samp><samp class="fr mobile">${config.reMobile}</samp></div>
					<div class="detailAddress">收货地址： ${config.reAddress}</div>
					<div class="icon icon-more"></div>`
					
					$("#orderAddress").html(html).attr('data-code',dCode);
				    $("#orderAddressWrap").removeClass('hidden');
            	}else{
            		config.receiver = '';
				    config.reMobile = '';
				    config.reAddress = '';
				    
				    $("#orderAddressWrap").addClass('hidden');
            	}
            	
            }
        });
		AddressList.showCont({
			code: c
		});
	}
	
	function addListener(){
		BindMobile.addMobileCont({
        	success: function() {
        		isBindMobile = true;
        		$("#subBtn").click()
        	},
        	error: function(msg) {
        		isBindMobile = false;
        		base.showMsg(msg);
        	},
        	hideBack: 1
        });
        
        //选择商品面板
		ActivityChooseMallList.addCont({
        	success: function() {
        	}
        });
        
        //选择租赁面板
		ActivityChooseLeaseList.addCont({
        	success: function() {
        	}
        });
        
        //选择商品
        $("#chooseMall").click(function(){
        	ActivityChooseMallList.showCont()
        })
        
        //选择租赁
        $("#chooseLease").click(function(){
        	ActivityChooseLeaseList.showCont()
        })
        
        //选择地址
        $("#chooseAddress").click(function(){
        	addressListAddCont($("#orderAddress").attr("data-code"))
        })
        //地址点击
        $("#orderAddressWrap").click(function(){
        	addressListAddCont($("#orderAddress").attr("data-code"))
        })
        
        //报名活动 点击
		$("#submitBtn").click(function(){
			location.href="../activity/submitOrder.html?type=2&code="+code
		})
        
	}
})
