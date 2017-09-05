define([
    'app/controller/base',
    'app/interface/MallCtr',
    'app/util/dict'
], function(base, MallCtr, Dict) {
    var code = base.getUrlParam("code"),
        orderStatus = Dict.get("mallOrderStatus");

    init();
    
    function init(){
        addListener();
        base.showLoading();
        getOrderDetail();
    }
    
    function getOrderDetail() {
        MallCtr.getOrderDetail(code, true)
            .then((data) => {
                base.hideLoading();
                
				//商品详情
                var htmlPro = '';
				data.productOrderList.forEach(function(d, i){
					var price = d.price2 ? base.formatMoney(d.price2)+'积分' : '￥'+base.formatMoney(d.price1)
					
					htmlPro += `<a class="mall-item" href="../mall/mallDetail.html?code=${d.productCode}">
		    		<div class="mall-item-img fl" style="background-image: url('${base.getImg(d.product.advPic)}');"></div>
		    		<div class="mall-item-con fr">
		    			<p class="name">${d.product.name}</p>
		    			<samp class="slogan">商品规格：${d.productSpecsName}</samp>
		    			<div class="price wp100">
		    				<samp class="samp1 fl">${price}</samp>
		    				<samp class="samp2 fr">x${d.quantity}</samp>
		    			</div></div></a>`;
				})
				$(".orderPro-list").html(htmlPro);
				
				//配送方式
				if(data.toUser == SYS_USER){
					var htmlAddress ='';
					htmlAddress = `<div class="icon icon-dz"></div>
					<div class="wp100 over-hide"><samp class="fl addressee">收货人：${data.receiver}</samp><samp class="fr mobile">${data.reMobile}</samp></div>
					<div class="detailAddress">收货地址： ${data.reAddress}</div>`;
					
					$("#orderAddress").html(htmlAddress)
					$("#orderAddress").removeClass('hidden');
					
				}else{
					$("#toUser .toUserName").html('自提');
					$("#storeAddress").html('自提地址：'+data.takeAddress)
					$("#storeAddress").removeClass('hidden');
				}
				//已发货
				if(data.logisticsCompany){
					var htmlExpress ='';
					htmlExpress = `<div class="icon icon-dz"></div>
					<div class="wp100 over-hide"><samp class="fl addressee">物流公司：${data.logisticsCompany}</samp></div>
					<div class="wp100 over-hide"><samp class="fl addressee">物流单号：${data.logisticsCode}</samp></div>`;
					
					$("#expressDelivery").html(htmlExpress)
					$("#expressDelivery").removeClass('hidden')
				}
				
				//卖家嘱托
				$("#applyNote").html(data.applyNote?data.applyNote:'无')
				
				
				//订单信息
				var htmlOrder = '';
				htmlOrder = `<p>订单号：${data.code}</p>
					<p>下单时间：${base.formatDate(data.applyDatetime,'yyyy-MM-dd hh:mm:ss')}</p>
					<p>下单人：${data.user.nickname}</p>
					${
                        data.status == "4"
                            ? `<p>确认收货时间：${base.formatDate(data.signDatetime,'yyyy-MM-dd hh:mm:ss')}</p>`
                            : data.status =='3'?
                            `<p>发货时间：${base.formatDate(data.deliveryDatetime,'yyyy-MM-dd hh:mm:ss')}</p>`
                            :''
                    }`;
				$("#orderInfo").html(htmlOrder);
				
				
				//按钮
				//待付款
				if(data.status=='1'){
					$('.mallBottom').removeClass('hidden')
					$("#payBtn").removeClass('hidden')
					$("#cancelBtn").removeClass('hidden')
				
				//待发货
				}else if(data.status=='2'){
					$('.mallBottom').removeClass('hidden')
					$("#reminderBtn").removeClass('hidden').html('催一下')
					if(data.promptTimes){
						$("#reminderBtn").removeClass('am-button-red').addClass('am-button-disabled').html('已催单');
						$("#reminderBtn").off('click')
					}
				//待收货
				}else if(data.status=='3'){
					$('.mallBottom').removeClass('hidden')
					$("#confirmBtn").removeClass('hidden')
					
				//待评价
				}else if(data.status=='4'){
					$('.mallBottom').removeClass('hidden')
					$("#commentBtn").removeClass('hidden')
				}
				
            });
    }

	function operateSuccess(){
		setTimeout(function(){
			location.reload(true)
		}, 800)
	}

    function addListener(){
    	//取消订单
        $("#cancelBtn").on("click", function() {
            base.confirm("确定取消订单吗？", "取消", "确认")
                .then(() => {
                    base.showLoading("取消中...");
                    MallCtr.cancelOrder(code)
                        .then(() => {
                        	base.hideLoading();
                            base.showMsg("取消成功",1000);
                            operateSuccess();
                        });
                }, () => {});
        });
        
        //确认收货
        $("#confirmBtn").on("click", function() {
            base.confirm('确认收货吗？')
                .then(() => {
                    base.showLoading("提交中...");
                    MallCtr.confirmOrder(code)
                        .then(() => {
                			base.hideLoading();
                            base.showMsg("操作成功",1000);
                            operateSuccess();
                        });
                }, () => {});
        });
        
        //立即支付
        $("#payBtn").on("click", function() {
            location.href = "../pay/pay.html?type=mall&code=" + code;
        });
        
    	//催单
        $("#reminderBtn").on("click", function() {
            base.showLoading("操作中...");
            
            MallCtr.reminderOrder(code)
                .then(() => {
                	base.hideLoading();
                    base.showMsg("催单成功",1000);
                    operateSuccess();
                });
        });
        
        //立即评价
        $("#commentBtn").on("click", function() {
			location.href='./order-comment.html?code='+code
        });
    }
});
