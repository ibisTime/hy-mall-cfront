define([
    'app/controller/base',
    'app/interface/MallCtr',
    'app/interface/LeaseCtr',
    'app/interface/ActivityStr',
    'app/interface/AccountCtr',
    'app/module/weixin',
], function(base, MallCtr, LeaseCtr, ActivityStr, AccountCtr, weixin) {
    const MALL_ORDER = "mall",LEASE_ORDER = "lease",ACTIVITY_ORDER = "activity";
    const BALANCE_PAY = 1, WX_PAY = 5;
    var code = base.getUrlParam("code"),
        type = base.getUrlParam("type"),//类型  
        isWxGroupQrcode = base.getUrlParam("isWxGroupQrcode") == '1',
        pay_type = 1;
    var dkAmount = 0;
    
    var account={
    	cny: 0,
    	jf: 0,
    	xjk: 0,
    }
    var actCode = '';

    init();
    function init(){
        if(!code) {
            base.showMsg("未传入订单编号");
        } else {
            base.showLoading();
            
			getAccount().then(()=>{
				//获取商城订单支付金额
	            if(type == MALL_ORDER) {
	            	
            		getDKAmountMall().then(getMallOrderDetail)
            		
        			$("#totalAmountWrap").removeClass("hidden")
        			$("#dkAmountWrap").removeClass("hidden")
	            //获取租赁订单支付金额
	            } else if(type == LEASE_ORDER) {
	            	
            		getDKAmountLease().then(getLeaseOrderDetail)
        			$("#totalAmountWrap").removeClass("hidden")
        			$("#dkAmountWrap").removeClass("hidden")
	            //获取活动订单支付金额
	            } else if(type == ACTIVITY_ORDER) {
	            	
        			getActivityOrderDetail()
	            } 
    		})
            
            addListener();
        }
    }
    
    //账户
    function getAccount(){
    	return AccountCtr.getAccount(true).then((data)=>{
    		data.forEach(function(d, i) {
	        	if (d.currency == "CNY") {
	        		account.cny = d.amount
	        	} else if (d.currency == "JF") {
	        		account.jf = d.amount
	        	} else if (d.currency == "XJK") {
	        		account.xjk = d.amount
	        	}
	        })
    	})
    }
    
    //商城查询可抵扣金额
    function getDKAmountMall(){
    	return MallCtr.getDKAmount(code).then((data) => {
    		dkAmount = data.cnyAmount;
    		$("#dkAmount samp").html("将使用"+base.formatMoney(data.jfAmount)+"积分抵扣"+base.formatMoney(data.cnyAmount)+"人民币")
        },()=>{})
    }
    
    //租赁查询可抵扣金额
    function getDKAmountLease(){
    	return LeaseCtr.getDKAmount(code).then((data) => {
    		dkAmount = data.cnyAmount;
    		$("#dkAmount samp").html("将使用"+base.formatMoney(data.jfAmount)+"积分抵扣"+base.formatMoney(data.cnyAmount)+"人民币")
        },()=>{})
    }
    
    // 详情查询商城订单
    function getMallOrderDetail() {
        MallCtr.getOrderDetail(code)
            .then((data) => {
                base.hideLoading();
                var price = '';
                var payAmount = '';
                if(!data.amount1&&data.amount2&&!data.yunfei){
                	price = base.formatMoney(data.amount2)+' 积分'
                	
                	$("#payName").html('积分支付');
	        		$("#accountAmount").html(''+base.formatMoney(account.jf)+'积分');
                }else if(data.amount1&&!data.amount2){
                	price = '￥ '+base.formatMoney(data.amount1+data.yunfei)+'<samp>(含运费：￥ '+base.formatMoney(data.yunfei)+')</samp>';
                	payAmount = '￥ '+base.formatMoney(data.amount1+data.yunfei-dkAmount)
                	
                	$("#payName").html('余额支付')
	        		$("#accountAmount").html('￥'+base.formatMoney(account.cny+account.xjk)+'<i>(含小金库)</i>');
                	$("#wxPay").removeClass('hidden')
                }else{
                	price = '￥ '+base.formatMoney(data.amount1+data.yunfei)+' + '+base.formatMoney(data.amount2)+' 积分'+'<samp>(含运费：￥ '+base.formatMoney(data.yunfei)+')</samp>'
                	payAmount = '￥ '+base.formatMoney(data.amount1+data.yunfei-dkAmount)+' + '+base.formatMoney(data.amount2)+' 积分'
                	
                	$("#payName").html('余额支付')
                	$("#wxPay").removeClass('hidden')
	        		$("#accountAmount").html(base.formatMoney(account.jf)+'积分 + ￥'+base.formatMoney(account.cny+account.xjk)+'<i>(含小金库)</i>');
                }
                
                $("#totalAmount").html(price).attr("data-totalAmount",price);
                $("#payAmount").html(payAmount).attr("data-payAmount",payAmount);
            });
    }
    
    // 详情查询租赁订单
    function getLeaseOrderDetail() {
        LeaseCtr.getOrderDetail(code)
            .then((data) => {
                base.hideLoading();
                var price = 0;
                var payAmount = 0;
                if(!data.amount1&&data.amount2&&!data.yunfei){
                	price = base.formatMoney(data.amount2)+' 积分'
                	
                	$("#payName").html('积分支付')
	        		$("#accountAmount").html(''+base.formatMoney(account.jf)+'积分');
                }else if(data.amount1&&!data.amount2){
                	price = '￥ '+base.formatMoney(data.amount1+data.yunfei);
                	payAmount = '￥ '+base.formatMoney(data.amount1+data.yunfei-dkAmount)
                	
                	$("#payName").html('余额支付')
                	$("#wxPay").removeClass('hidden')
	        		$("#accountAmount").html('￥'+base.formatMoney(account.cny+account.xjk)+'<i>(含小金库)</i>');
                }else{
                	price = '￥ '+base.formatMoney(data.amount1+data.yunfei)+' + '+base.formatMoney(data.amount2)+' 积分'
                	payAmount = '￥ '+base.formatMoney(data.amount1+data.yunfei-dkAmount)+' + '+base.formatMoney(data.amount2)+' 积分'
                	
                	$("#payName").html('余额支付')
                	$("#wxPay").removeClass('hidden')
	        		$("#accountAmount").html(base.formatMoney(account.jf)+'积分 + ￥'+base.formatMoney(account.cny+account.xjk)+'<i>(含小金库)</i>');
                }
                
                $("#totalAmount").html(price).attr("data-totalAmount",price);
                $("#payAmount").html(payAmount).attr("data-payAmount",payAmount);
            });
    }
    
    // 详情查询活动订单
    function getActivityOrderDetail() {
        ActivityStr.getOrderDetail(code)
            .then((data) => {
                base.hideLoading();
                actCode = data.activity.code;
                var price = 0;
            	price = '￥ '+base.formatMoney(data.totalAmount1);
            	
            	$("#payName").html('余额支付')
        		$("#accountAmount").html('￥'+base.formatMoney(account.cny+account.xjk)+'<i>(含小金库)</i>');
            	$("#wxPay").removeClass('hidden')
            	
                $("#payAmount").html(price);
                
            });
    }
    
    function addListener() {
        $("#payType").on("click", ".pay-item", function() {
            var _me = $(this);
            if(!_me.hasClass("active")) {
                _me.addClass("active").siblings(".active").removeClass("active");
                if(_me.index()==0){
                	pay_type = 1;//余额
                }else if(_me.index()==1){
                	pay_type = 5;//微信
                }
                
            }
        });
        $("#payBtn").on("click", function(){
            base.showLoading("支付中...");
            
            payByBalance();
        });
        
        $("#dkAmount").click(function(){
        	if($(this).hasClass("active")){
        		$(this).removeClass("active")
                $("#payAmount").html($("#totalAmount").attr("data-totalAmount"));
        	}else{
        		$(this).addClass("active")
                $("#payAmount").html($("#payAmount").attr("data-payAmount"));
        	}
        })
        
    }
    
    //判断支付接口调用类型
    function payByBalance(){
    	if(type==MALL_ORDER){
    		payMallOrder(pay_type);
    	}else if(type==LEASE_ORDER){
    		payLeaseOrder(pay_type)
    	}else if(type==ACTIVITY_ORDER){
    		payActivityOrder(pay_type)
    	}
    }
    
    // 支付商城订单
    function payMallOrder(payType) {
    	var config = {
    		payType:payType,
    		codeList:[code]
    	}
    	if($("#dkAmount").hasClass("active")){
    		config.isDk = 1
    	}else{
    		config.isDk = 0
    	}
        MallCtr.payOrder(config,true)
            .then((data) => {
                if(pay_type == WX_PAY) {
                    wxPay(data);
                } else {
                    base.hideLoading();
                    base.showMsg("支付成功");
                    setTimeout(() => {
                    	base.gohrefReplace("../user/mall-orders.html");
                    }, 500);
                }
            });
    }
    
    // 支付租赁订单
    function payLeaseOrder(payType) {
    	var config = {
    		payType:payType,
    		codeList:[code]
    	}
    	if($("#dkAmount").hasClass("active")){
    		config.isDk = 1
    	}else{
    		config.isDk = 0
    	}
        LeaseCtr.payOrder(config,true)
            .then((data) => {
                if(pay_type == WX_PAY) {
                    wxPay(data);
                } else {
                    base.hideLoading();
                    base.showMsg("支付成功");
                    setTimeout(() => {
                    	base.gohrefReplace("../user/lease-orders.html");
                    }, 500);
                }
            });
    }
    
    // 支付活动订单
    function payActivityOrder(payType) {
    	var config = {
    		payType:payType,
    		codeList:[code]
    	}
        ActivityStr.payOrder(config,true)
            .then((data) => {
                if(pay_type == WX_PAY) {
                    wxPay(data);
                } else {
                    base.hideLoading();
                    base.showMsg("支付成功");
                    setTimeout(() => {
                        if(isWxGroupQrcode=='1'){
	                		base.gohrefReplace("../activity/doSuccess.html?code="+actCode);
						} else {
	                		base.gohrefReplace("../user/activity-orders.html");
						}
                    }, 500);
                }
            });
    }
    
    function wxPay(data) {
        if (data && data.signType) {
            weixin.initPay(data, () => {
                base.showMsg("支付成功");
                setTimeout(function(){
                    location.href = "../user/user.html";
                }, 500);
            }, () => {
                base.showMsg("支付失败");
            });
        } else {
            base.hideLoading();
            base.showMsg("微信支付失败");
        }
    }
});
