define([
    'app/controller/base',
    'app/util/dict',
    'app/interface/ActivityStr',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr'
], function(base, Dict, ActivityStr, GeneralCtr, UserCtr) {
    var code = base.getUrlParam("code"),
        orderStatus = {},
    	expressDict = {},
    	backLogisticsCompanyDict = {},
    	takeType;

    init();
    
    function init(){
        base.showLoading();
        //获取状态数据字典
		GeneralCtr.getDictList({parentKey:'act_order_status'},'801907').then((data)=>{
    		data.forEach(function(d, i){
    			base.hideLoading()
    			orderStatus[d.dkey]=d.dvalue
    		})
    		
			$.when(
	        	getOrderDetail()
	        )
		},base.hideLoading);
		
        addListener();
    }
    
    //获取详情
    function getOrderDetail() {
        ActivityStr.getOrderDetail(code, true)
            .then((data) => {
                base.hideLoading();
                
                takeType = data.takeType;
                
				//活动详情
				var activityHtmlPro = `<a class="mall-item actOrder-item" href="../activity/activity-detail.html?code=${data.activity.code}">
		    		<div class="mall-item-img fl" style="background-image: url('${base.getImg(data.activity.advPic)}');"></div>
		    		<div class="mall-item-con fr pb30">
		    			<p class="name">${data.activity.name}</p>
		    			<samp class="slogan">集合地:${data.activity.placeAsse}</samp>
						<samp class="slogan">目的地:${data.activity.placeDest}</samp>
						<samp class="slogan">${base.formatDate(data.activity.startDatetime, "yyyy-MM-dd")}至${base.formatDate(data.activity.endDatetime, "yyyy-MM-dd")}</samp>
		    			<div class="price wp100">
		    				<samp class="samp1 fl">￥${base.formatMoney(data.activity.amount)}</samp>
		    			</div></div></a>`;
				
				$("#activityList").html(activityHtmlPro);
				
				$(".actOrderAmount .actAmount samp").text('￥'+base.formatMoney(data.amount))
				$("#leaderInfo").html(data.leadUser.outName+"("+data.leadUser.mobile+")")
				
				
				//有选择商品
				if(data.orderData){
					var mallHtmlPro = '';
					data.orderData.productOrderList.forEach(function(d, i){
						var price = d.price2 ? base.formatMoney(d.price2)+'积分' : '￥'+base.formatMoney(d.price1)
						
						mallHtmlPro += `<a class="mall-item" href="../mall/mallDetail.html?code=${d.productCode}">
			    		<div class="mall-item-img fl" style="background-image: url('${base.getImg(d.product.advPic)}');"></div>
			    		<div class="mall-item-con fr">
			    			<p class="name">${d.product.name}</p>
			    			<samp class="slogan">${d.productSpecsName}</samp>
			    			<div class="price wp100">
			    				<samp class="samp1 fl">${price}</samp>
			    				<samp class="samp2 fr">x${d.quantity}</samp>
			    			</div></div></a>`;
					})
					$("#mallList").html(mallHtmlPro);
					$("#mallListTitle").removeClass('hidden');
					
					$(".actOrderAmount .mallAmount samp").html('￥'+base.formatMoney(data.orderData.amount1))
					$(".actOrderAmount .mallAmount").removeClass('hidden');
				}
				//有选择租赁
				if(data.rorderList){
					
					var leaseHtmlPro = '';
					var realDeposit = 0;
					var rproductAmount = 0;
					data.rorderList.forEach(function(d, i){
						var price = d.price2 ? base.formatMoney(d.price2)+'积分' : '￥'+base.formatMoney(d.price1)
						
						leaseHtmlPro += `<a class="mall-item" href="../lease/lease-detail.html?code=${d.rproduct.code}">
						<div class="mall-item-img fl" style="background-image: url('${base.getImg(d.rproduct.advPic)}')"></div>
						<div class="mall-item-con fr">
							<p class="name">${d.rproduct.name}</p>
							<samp class="slogan">开始租赁日期：${base.formatDate(d.bookDatetime, "yyyy-MM-dd")}</samp>
							<samp class="slogan">租赁时长：${d.rentDay}天&nbsp;&nbsp;&nbsp;&nbsp;数量：${d.quantity}</samp>
							<div class="price over-hide mt10">
								<samp class="samp1">￥${base.formatMoney(d.amount1)}</samp>
								<samp class="realDeposit">(含押金: ${'￥'+base.formatMoney(d.realDeposit)})</samp>
							</div>
							</div></a>`;
						realDeposit += d.realDeposit;
						rproductAmount += d.amount1;
						
					})
					
					$("#leaseList").html(leaseHtmlPro);
					$("#leaseListTitle").removeClass('hidden');
					
					$(".actOrderAmount .leaseAmount samp").html('￥'+base.formatMoney(rproductAmount)+"<i>(含押金：￥"+base.formatMoney(realDeposit)+")</i>")
					$(".actOrderAmount .leaseAmount").removeClass('hidden');
				}
				//有选择商品或租赁时显示运费和收货地址
				if(data.orderData){
					//邮寄
					if(data.orderData.toUser==SYS_USER){
						//收货地址
						var htmlAddress ='';
							htmlAddress = `<div class="icon icon-dz"></div>
							<div class="wp100 over-hide"><samp class="fl addressee">收货人：${data.orderData.receiver}</samp><samp class="fr mobile">${data.orderData.reMobile}</samp></div>
							<div class="detailAddress">收货地址： ${data.orderData.reAddress}</div>`;
						
						$("#toUser .toUserName").html('邮寄');
						$("#toUser").removeClass('hidden');
						$("#orderAddress").html(htmlAddress)
						$("#orderAddress").removeClass('hidden');
					//自提
					}else{
						
						$("#toUser .toUserName").html('自提');
						$("#toUser").removeClass('hidden');
						$("#storeAddress").html('自提地址：'+data.orderData.takeAddress)
						$("#storeAddress").removeClass('hidden');
					}
					
				}else if(data.rorderList){
					
					//邮寄
					if(data.rorderList[0].toUser==SYS_USER){
						//收货地址
						var htmlAddress ='';
							htmlAddress = `<div class="icon icon-dz"></div>
							<div class="wp100 over-hide"><samp class="fl addressee">收货人：${data.rorderList[0].receiver}</samp><samp class="fr mobile">${data.rorderList[0].reMobile}</samp></div>
							<div class="detailAddress">收货地址： ${data.rorderList[0].reAddress}</div>`;
							
						$("#toUser .toUserName").html('邮寄');
						$("#orderAddress").html(htmlAddress)
						$("#orderAddress").removeClass('hidden');
					//自提
					}else{
						
						$("#toUser .toUserName").html('自提');
						$("#storeAddress").html('自提地址：'+data.rorderList[0].takeAddress)
						$("#storeAddress").removeClass('hidden');
					}
				}
				//订单总金额
				$(".actOrderAmount .totalAmount samp").html('￥'+base.formatMoney(data.totalAmount1))
				
				//下单说明
				$("#applyNote").html(data.applyNote?data.applyNote:'无')
				
				//订单信息
				var htmlOrder = '';
				htmlOrder = `<p>订单号：${data.code}</p>
					<p>订单状态：${orderStatus[data.status]}</p>
					<p>下单时间：${base.formatDate(data.applyDatetime,'yyyy-MM-dd hh:mm:ss')}</p>`;
				
				$("#orderInfo").html(htmlOrder);
				
				//按钮
				//待付款
				if(data.status=='1'){
					$('.mallBottom').removeClass('hidden')
					$("#payBtn").removeClass('hidden')
					$("#cancelBtn").removeClass('hidden')
				
				//用户取消 
				}else if(data.status=='91'){
					$('.mallBottom').removeClass('hidden')
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
            base.confirm("确定取消报名吗？", "取消", "确认")
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
