define([
    'app/controller/base',
    'app/interface/MallCtr',
    'app/interface/AccountCtr',
    'app/module/weixin'
], function(base, MallCtr, AccountCtr, weixin) {
    const MALL_ORDER = "mall";
    const BALANCE_PAY = 1, WX_PAY = 5;
    var code = base.getUrlParam("code"),
        type = base.getUrlParam("type"),
        proType = base.getUrlParam("type"),//商品类型
        pay_type = 1;

    init();
    function init(){
//      if(!type) {
//          base.showMsg("未传入订单类型");
//      } else
        if(!code) {
            base.showMsg("未传入订单编号");
        } else {
            base.showLoading();
            //获取支付金额
            if(type == MALL_ORDER) {
                getMallOrderDetail();
            } 
            addListener();
        }
    }
    // 详情查询商城订单
    function getMallOrderDetail() {
        MallCtr.getOrderDetail(code)
            .then((data) => {
                base.hideLoading();
                var price = 0;
                if(!data.amount1&&data.amount2){
                	price = base.formatMoney(data.amount2)+' 积分'
                }else if(data.amount1&&!data.amount2){
                	price = '￥ '+base.formatMoney(data.amount1);
                }else{
                	price = '￥ '+base.formatMoney(data.amount1)+' + '+base.formatMoney(data.amount2)+' 积分'
                }
                
                $("#totalAmount").html(price);
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
    }
    
    //判断支付接口调用类型
    function payByBalance(){
    	if(type==MALL_ORDER){
    		payMallOrder(pay_type);
    	}
    }
    
    // 支付商城订单
    function payMallOrder(payType) {
    	var config = {
    		payType:payType,
    		codeList:[code]
    	}
        MallCtr.payOrder(config,true)
            .then((data) => {
                if(pay_type == WX_PAY) {
                    wxPay(data);
                } else {
                    base.hideLoading();
                    base.showMsg("支付成功");
                    setTimeout(() => {
                        location.href = "../user/user.html";
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
