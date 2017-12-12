define([
    'app/controller/base',
    'app/util/dict',
    'app/interface/ActivityStr',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr'
], function(base, Dict, ActivityStr, GeneralCtr, UserCtr) {
    var code = base.getUrlParam("code"),
        orderStatus = Dict.get("leaseOrderStatus"),
    	expressDict = {},
    	backLogisticsCompanyDict = {},
    	takeType;

    init();
    
    function init(){
        addListener();
        base.showLoading();
    	getOrderDetail();
    }
    
    //获取详情
    function getOrderDetail() {
        ActivityStr.getOrderDetail(code, true)
            .then((data) => {
                base.hideLoading();
                
                takeType = data.takeType;
                
				//商品详情
                var htmlPro = '';
				var price = data.price2 ? base.formatMoney(data.price2)+'积分' : '￥'+base.formatMoney(data.price1)
				
				htmlPro += `<a class="mall-item" href="../lease/lease-detail.html?code=${data.activity.code}">
						<div class="mall-item-img fl" style="background-image: url('${base.getImg(data.activity.advPic)}')"></div>
						<div class="mall-item-con fr">
							<p class="name">${data.activity.name}</p>
							<samp class="slogan">数量：${data.quantity}</samp>
							<samp class="slogan">租赁时长：${data.rentDay}天&nbsp;&nbsp;&nbsp;&nbsp;${data.price2 ? base.formatMoney(data.price2)+'积分' : '￥'+base.formatMoney(data.price1)}/天</samp>
							<div class="amountWrap">
								<p class='fl amount'>总价: <samp>${data.price2 ? base.formatMoney(data.amount2)+'积分+￥'+base.formatMoney(data.amount1+data.yunfei) : '￥'+base.formatMoney(data.amount1+data.yunfei)}</samp></p>
								<p class="realDeposit fl">含押金: ${'￥'+base.formatMoney(data.realDeposit)} ${data.yunfei?' 运费:￥'+base.formatMoney(data.yunfei)+'':''} </p>
							</div>
							</div></a>`;
					    			
				$(".orderPro-list").html(htmlPro);
				
				
				//下单说明
				$("#applyNote").html(data.applyNote?data.applyNote:'无')
				
				//订单信息
				var htmlOrder = '';
				htmlOrder = `<p>订单号：${data.code}</p>
					<p>订单状态：${orderStatus[data.status]}</p>
					<p>下单时间：${base.formatDate(data.applyDatetime,'yyyy-MM-dd hh:mm:ss')}</p>`;
				
				if(data.status =='3' || data.status =='4' || data.status =='5' || data.status =='6' || data.status =='7' || data.status =='8' || data.status =='9' ){
					htmlOrder +=`<p>发货时间：${base.formatDate(data.deliveryDatetime,'yyyy-MM-dd hh:mm:ss')}</p>`
				}
				if(data.status =='4' || data.status =='5' || data.status =='6' || data.status =='7' || data.status =='8' || data.status =='9' ){
					htmlOrder +=`<p>确认收货时间：${base.formatDate(data.signDatetime,'yyyy-MM-dd hh:mm:ss')}</p>
							<p>开始体验时间：${base.formatDate(data.rstartDatetime,'yyyy-MM-dd hh:mm:ss')}</p>
							<p>结束体验时间：${base.formatDate(data.rendDatetime,'yyyy-MM-dd hh:mm:ss')}</p>
							<p>归还截止时间：${base.formatDate(data.overdueStartDatetime,'yyyy-MM-dd hh:mm:ss')}</p>`
				}
				if(data.status =='5' || data.status =='7' || data.status =='9' ){
					htmlOrder +=`<p>归还申请时间：${base.formatDate(data.backApplyDatetime,'yyyy-MM-dd hh:mm:ss')}</p>`;
				}
				if(data.status =='7' || data.status =='9' ){
					htmlOrder +=`<p>确认归还时间：${base.formatDate(data.backDatetime,'yyyy-MM-dd hh:mm:ss')}</p>`;
				}
				//已逾期
				if(data.status =='5' || data.status =='6' || data.status =='7' || data.status =='8' || data.status =='9' ){
					htmlOrder += data.overdueDay?`<p>逾期开始时间：${base.formatDate(data.overdueStartDatetime,'yyyy-MM-dd hh:mm:ss')}</p>
								${data.status == '8'?`<p>逾期截止时间：${base.formatDate(data.overdueEndDatetime,'yyyy-MM-dd hh:mm:ss')}</p>`:''}
								<p>已逾期天数：${data.overdueDay}天</p>
								<p>逾期金额：${base.formatMoney(data.overdueAmount)}元</p>`:''
				}
                        
				$("#orderInfo").html(htmlOrder);
				
				//按钮
				//待付款
				if(data.status=='1'){
					$('.mallBottom').removeClass('hidden')
					$("#payBtn").removeClass('hidden')
					$("#cancelBtn").removeClass('hidden')
				
				//待发货
				}else if(data.status=='2'){
					if(data.promptTimes){
						$("#reminderBtn").removeClass('am-button-red').addClass('am-button-disabled').html('已催单');
						$("#reminderBtn").off('click')
					}else{
						$("#reminderBtn").html('催一下')
					}
					
					$('.mallBottom').removeClass('hidden')
					$("#reminderBtn").removeClass('hidden')
				//待收货
				}else if(data.status=='3'){
					$('.mallBottom').removeClass('hidden')
					$("#confirmBtn").removeClass('hidden')
					
				//待归还
				}else if(data.status=='4'){
					
					$('.mallBottom').removeClass('hidden')
					$("#returnBtn").removeClass('hidden')
					
				//逾期中
				}else if(data.status=='6'){
					
					$('.mallBottom').removeClass('hidden')
					$("#returnBtn").removeClass('hidden')
					
				//待评价
				}else if(data.status=='7'){
					$('.mallBottom').removeClass('hidden')
					$("#commentBtn").removeClass('hidden')
					
				//用户取消 删除订单按钮
				}else if(data.status=='91'){
					$('.mallBottom').removeClass('hidden')
					$("#deleteBtn").removeClass('hidden')
				}
            });
    }

	function operateSuccess(){
		setTimeout(function(){
			location.replace('./activity-orders.html')
		}, 800)
	}

    function addListener(){
    	//取消订单
        $("#cancelBtn").on("click", function() {
            base.confirm("确定取消订单吗？", "取消", "确认")
                .then(() => {
                    base.showLoading("取消中...");
                    ActivityStr.cancelOrder(code)
                        .then(() => {
                        	base.hideLoading();
                            base.showMsg("取消成功",1000);
                            operateSuccess();
                        });
                }, () => {});
        });
        
        //立即支付
        $("#payBtn").on("click", function() {
            location.href = "../pay/pay.html?type=mall&code=" + code;
        });
        
        //立即评价
        $("#commentBtn").on("click", function() {
			location.href='./order-comment.html?type=lease&code='+code
        });
        
    }
});
