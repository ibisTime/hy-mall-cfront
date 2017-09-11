define([
    'app/controller/base',
    'app/interface/LeaseCtr',
    'app/util/dict',
    'app/interface/GeneralCtr'
], function(base, LeaseCtr, Dict, GeneralCtr) {
    var code = base.getUrlParam("code"),
        orderStatus = Dict.get("leaseOrderStatus");

    init();
    
    function init(){
        addListener();
        base.showLoading();
        $.when(
        	getOrderDetail(),
        	getBackLogisticsCompany()
        )
    }
    
    function getOrderDetail() {
        LeaseCtr.getOrderDetail(code, true)
            .then((data) => {
                base.hideLoading();
                
				//商品详情
                var htmlPro = '';
				var price = data.price2 ? base.formatMoney(data.price2)+'积分' : '￥'+base.formatMoney(data.price1)
				
				htmlPro += `<a class="mall-item" href="./lease-orderDetail.html?code=${data.code}">
						<div class="mall-item-img fl" style="background-image: url('${base.getImg(data.rproduct.advPic)}')"></div>
						<div class="mall-item-con fr">
							<p class="name">${data.rproduct.name}</p>
							<samp class="slogan">数量：${data.quantity}</samp>
							<samp class="slogan">租赁时长：${data.rentDay}天&nbsp;&nbsp;&nbsp;&nbsp;${data.price2 ? base.formatMoney(data.price2)+'积分' : '￥'+base.formatMoney(data.price1)}/天</samp>
							<div class="amountWrap">
								<p class='fl amount'>总价: <samp>${data.price2 ? base.formatMoney(data.amount2)+'积分+￥'+base.formatMoney(data.amount1) : '￥'+base.formatMoney(data.amount1)}</samp></p>
								<p class="realDeposit fl">含押金: ${'￥'+base.formatMoney(data.realDeposit)}</p>
							</div>
							</div></a>`;
					    			
				$(".orderPro-list").html(htmlPro);
				
				//配送方式
				if(data.takeType == '2'){
					var htmlAddress ='';
					htmlAddress = `<div class="icon icon-dz"></div>
					<div class="wp100 over-hide"><samp class="fl addressee">收货人：${data.receiver}</samp><samp class="fr mobile">${data.reMobile}</samp></div>
					<div class="detailAddress">收货地址： ${data.reAddress}</div>`;
					
					$("#toUser .toUserName").html('快递');
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
				
				//已归还
				if(data.backType){
					//自提
					if(data.backType == '1'){
						$("#returnOrder .text samp").html('自提');
						$("#returnStoreAddress").html('自提地址：'+data.backAddress)
						$("#returnStoreAddress").removeClass('hidden');
					//邮寄
					}else{
						
						var htmlExpress ='';
						htmlExpress = `<div class="icon icon-dz"></div>
						<div class="wp100 over-hide"><samp class="fl addressee">物流公司：${data.backLogisticsCompany}</samp></div>
						<div class="wp100 over-hide"><samp class="fl addressee">物流单号：${data.backLogisticsCode}</samp></div>`;
						
						$("#returnOrder .text  samp").html('快递');
						$("#returnExpressDelivery").html(htmlExpress)
						$("#returnExpressDelivery").removeClass('hidden')
					}
					
					$("#returnOrder").removeClass('hidden')
				}
				
				//下单说明
				$("#applyNote").html(data.applyNote?data.applyNote:'无')
				
				
				//订单信息
				var htmlOrder = '';
				htmlOrder = `<p>订单号：${data.code}</p>
					<p>订单状态：${orderStatus[data.status]}</p>
					<p>下单时间：${base.formatDate(data.applyDatetime,'yyyy-MM-dd hh:mm:ss')}</p>
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
					
				//待评价
				}else if(data.status=='7'){
					$('.mallBottom').removeClass('hidden')
					$("#commentBtn").removeClass('hidden')
				}
				
            });
    }


    //获取物流公司列表
    function getBackLogisticsCompany(){
    	GeneralCtr.getDictList('kd_company','808907').then((data)=>{
    		var html = ''
    		data.forEach(function(d, i){
    			html += `<option value='${d.dkey}'>${d.dvalue}</option>`;
    		})
    		
    		$("#backLogisticsCompany").append(html)
    	},()=>{})
    }
    

	function operateSuccess(){
		setTimeout(function(){
			location.reload(true)
		}, 800)
	}

	//归还租赁
    function returnOrder(param){
        base.confirm('确认归还吗？').then(() => {
	    	base.showLoading("提交中...");
	        LeaseCtr.returnOrder(param)
	            .then(() => {
	            	
	                base.hideLoading();
	                base.showMsg("操作成功");
	                operateSuccess()
	            });
        }, () => {});
    }
    
    //弹窗取消
    function dialgoClose(){
    	$("#dialog").addClass('hidden');
            
        $("#backType option").eq(0).prop("selected", 'selected');
		$("#backLogisticsCompany option").eq(0).prop("selected", 'selected');
		$("#backLogisticsCode").val("");
		$("#backAddress").val("");
		
        $(".backLogisticsCompany").removeClass('hidden')
		$(".backLogisticsCode").removeClass('hidden')
		$(".backAddress").addClass('hidden')
    }

    function addListener(){
    	//取消订单
        $("#cancelBtn").on("click", function() {
            base.confirm("确定取消订单吗？", "取消", "确认")
                .then(() => {
                    base.showLoading("取消中...");
                    LeaseCtr.cancelOrder(code)
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
                    LeaseCtr.confirmOrder(code)
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
            
            LeaseCtr.reminderOrder(code)
                .then(() => {
                	base.hideLoading();
                    base.showMsg("催单成功",1000);
                    operateSuccess();
                });
        });
        
        //立即评价
        $("#commentBtn").on("click", function() {
			location.href='./order-comment.html?type=lease&code='+code
        });
        
        //归还方式选择
        $("#backType").on('change',function(){
        	//上门取件
        	if($(this).val()== 1){
        		$(".backLogisticsCompany").addClass('hidden')
        		$(".backLogisticsCode").addClass('hidden')
        		$(".backAddress").removeClass('hidden')
        	//快递
        	}else{
        		$(".backLogisticsCompany").removeClass('hidden')
        		$(".backLogisticsCode").removeClass('hidden')
        		$(".backAddress").addClass('hidden')
        	}
        })
        
        //归还按钮
        $("#returnBtn").on("click", function() {
            $("#dialog #confirm").attr('data-code', code)
            $("#dialog").removeClass('hidden');
        });
        
        //归还弹窗-取消
        $("#dialog #canlce").click(function(){
            dialgoClose();
        })
        
        //归还弹窗-确认
        $("#dialog #confirm").click(function(){
        	//上门取件
        	if($("#backType").val()==1){
        		
        		if($("#backAddress").val()=='' && !$("#backAddress").val()){
	        		$(".backAddress .error").removeClass('hidden');
	        	}else{
	        		var param = {
			    		code: $(this).attr('data-code'),
						backType: 1,
			    		backAddress: $("#backAddress").val()
			    	}
	        		returnOrder(param)
	        	}
        	//邮递
        	}else{
        		if($("#backLogisticsCompany").val()=='' && !$("#backLogisticsCode").val()){
        			console.log($("#backLogisticsCompany").val())
	        		$(".backLogisticsCompany .error").removeClass('hidden');
	        	}else if($("#backLogisticsCode").val()=='' && !$("#backLogisticsCode").val()){
	        		$(".backLogisticsCode .error").removeClass('hidden');
	        	}else{
	        		var param = {
			    		code: $(this).attr('data-code'),
						backType: 2,
						backLogisticsCode: $("#backLogisticsCode").val(),
						backLogisticsCompany: $("#backLogisticsCompany").val(),
			    	}
	        		returnOrder(param)
	        	}
        		
        	}
        	
        })
        
        $("#backLogisticsCode").focus(function(){
        	$(".backLogisticsCode .error").addClass('hidden');
        })
        
        $("#backAddress").focus(function(){
        	$(".backAddress .error").addClass('hidden');
        })
        
        $("#backLogisticsCompany").change(function(){
        	$(".backLogisticsCompany .error").addClass('hidden');
        })
    }
});
