define([
    'app/controller/base',
    'app/interface/LeaseCtr',
    'app/util/dict',
    'app/module/qiniu',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr'
], function(base, LeaseCtr, Dict, qiniu, GeneralCtr, UserCtr) {
    var code = base.getUrlParam("code"),
        orderStatus = Dict.get("leaseOrderStatus"),
    	expressDict = {},
    	backLogisticsCompanyDict = {},
    	takeType;

    init();
    
    function init(){
        addListener();
        base.showLoading();
        
        getBackLogisticsCompany().then(()=>{
        	getOrderDetail();
        	getReturnAddress();
        })
        initUpload();
    }
    
    //获取自提点
    function getBackStore(){
    	return UserCtr.getPagePartner(true).then((data)=>{
    		var html = '';
    		
    		data.list.forEach(function(d, i){
    			html+=`<option value="${d.userId}" data-address="${d.province+' '+d.city+' '+d.area+' '+d.address}">${d.realName}</option>`
    		})
    		
    		$('#backStore').html(html);
    		$("#backStoreAddress .textarea").html($('#backStore option:selected').attr('data-address'))
    	})
    }
    
    //获取详情
    function getOrderDetail() {
        LeaseCtr.getOrderDetail(code, true)
            .then((data) => {
                base.hideLoading();
                
                takeType = data.takeType;
                
                
				//商品详情
                var htmlPro = '';
				var price = data.price2 ? base.formatMoney(data.price2)+'积分' : '￥'+base.formatMoney(data.price1)
				
				htmlPro += `<a class="mall-item" href="../lease/lease-detail.html?code=${data.rproduct.code}">
						<div class="mall-item-img fl" style="background-image: url('${base.getImg(data.rproduct.advPic)}')"></div>
						<div class="mall-item-con fr">
							<p class="name">${data.rproduct.name}</p>
							<samp class="slogan">数量：${data.quantity}</samp>
							<samp class="slogan">租赁时长：${data.rentDay}天&nbsp;&nbsp;&nbsp;&nbsp;${data.price2 ? base.formatMoney(data.price2)+'积分' : '￥'+base.formatMoney(data.price1)}/天</samp>
							<div class="amountWrap">
								<p class='fl amount'>总价: <samp>${data.price2 ? base.formatMoney(data.amount2)+'积分+￥'+base.formatMoney(data.amount1+data.yunfei) : '￥'+base.formatMoney(data.amount1+data.yunfei)}</samp></p>
								<p class="realDeposit fl">含押金: ${'￥'+base.formatMoney(data.realDeposit)} ${data.yunfei?' 运费:￥'+base.formatMoney(data.yunfei)+'':''} </p>
							</div>
							</div></a>`;
					    			
				$(".orderPro-list").html(htmlPro);
				
				
				//已发货
				if(data.logisticsCompany){
					var htmlExpress ='';
					htmlExpress = `<div class="icon icon-dz"></div>
					<div class="wp100 over-hide"><samp class="fl addressee">物流公司：${expressDict[data.logisticsCompany]}</samp></div>
					<div class="wp100 over-hide"><samp class="fl addressee">物流单号：${data.logisticsCode}</samp></div>`;
					
					$("#expressDelivery").html(htmlExpress)
					$("#expressDelivery").removeClass('hidden')
				}
				
				//已归还
				if(data.backType){
					//自提
					if(data.backType == '1'){
						$("#returnOrder .text samp").html('上门归还');
						$("#returnStoreAddress").html('归还地址：'+data.backAddress)
						$("#returnStoreAddress").removeClass('hidden');
					//邮寄
					}else{
						var htmlExpress ='';
						htmlExpress = `<div class="icon icon-dz"></div>
						<div class="wp100 over-hide"><samp class="fl addressee">物流公司：${backLogisticsCompanyDict[data.backLogisticsCompany]}</samp></div>
						<div class="wp100 over-hide"><samp class="fl addressee">物流单号：${data.backLogisticsCode}</samp></div>`;
						
						//物流单
						if(data.backPdf){
							htmlExpress += `<div class="wp100 over-hide"><samp class="fl addressee">物流单：</samp><img class='backPdf' src='${base.getImg(data.backPdf)}'/></div>`;
						}
						
						$("#returnOrder .text  samp").html('快递');
						$("#returnExpressDelivery").html(htmlExpress)
						$("#returnExpressDelivery").removeClass('hidden')
					}
					
					$("#returnOrder").removeClass('hidden')
				}
				
				//运费
				if(data.yunfei){
					$("#yunfei").html('￥'+base.formatMoney(data.yunfei));
					$(".yunfeiWrap").removeClass('hidden')
				}
				
				//下单说明
				$("#applyNote").html(data.applyNote?data.applyNote:'无')
				
				
				//归还地址
				if(data.status =='4' || data.status =='6' ){
					
					$("#returnAddress").removeClass('hidden');
				}
				
				//订单信息
				var htmlOrder = '';
				
				var amountHtml = ''
				
				if(!data.relationNo){
					var totalAmount = data.amount2 ? base.formatMoney(data.amount2)+'积分' : '￥'+base.formatMoney(data.amount1+data.yunfei);
					var payAmount = '';
					var dkHtml = '';
					
					if(data.dkJfAmount){
						dkHtml=`<p>抵扣：${base.formatMoney(data.dkJfAmount)}积分抵扣${base.formatMoney(data.dkAmount)}人民币</p>`
					}
					if(data.payAmount2&&data.payAmount1){
						payAmount = '￥'+base.formatMoney(data.payAmount1)+'+'+base.formatMoney(data.payAmount2)+'积分';
					}else if(data.payAmount2&&!data.payAmount1){
						payAmount = base.formatMoney(data.payAmount2)+'积分'
					}else if(data.payAmount1&&!data.payAmount2){
						payAmount = '￥'+base.formatMoney(data.payAmount1)
					}
					amountHtml=`<p>订单总价：${totalAmount}</p>
								<p>实付金额：${payAmount}</p>
								${dkHtml}`
				}
				
				htmlOrder = `<p>订单号：${data.code}</p>
					<p>订单状态：${orderStatus[data.status]}</p>
					<p>下单时间：${base.formatDate(data.applyDatetime,'yyyy-MM-dd hh:mm:ss')}</p>
					${amountHtml}`;
				
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
				if(data.status=='1' && !data.relationNo){
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
				
				//配送方式
				//takeType 1:自提 , 2: 邮寄
				
            	var htmlCackType = '';
				var htmlReturnAddressType = '';
            	
                if(takeType == '1'){
	            	htmlCackType = '<option value="1" selected>上门归还</option><option value="2">邮寄</option>';
	            	$("#toUser .toUserName").html('自提');
					$("#storeAddress").html('自提地址：'+data.takeAddress)
					$("#storeAddress").removeClass('hidden');
					
					htmlReturnAddressType = '<option value="2">自提点</option><option value="1">平台</option>';
					
					$("#dialog-returnAddress1 .textarea").html(data.storeUser.realName+' '+data.storeUser.mobile+' '+data.takeAddress)
		    		$("#dialog-returnAddress1").attr('data-backAddress',data.storeUser.realName+' '+data.storeUser.mobile+' '+data.takeAddress)
            		$("#dialog #confirm").attr('data-backAddress', data.storeUser.realName+' '+data.storeUser.mobile+' '+data.takeAddress)
            		
            		$('#backStore option').each(function(i,d){
            			if(d.value ==data.storeUser.userId){
            				$('#backStore option').eq(i).attr('selected','selected')
							$("#backStoreAddress .textarea").html($('#backStore option').eq(i).attr('data-address'))
            				return false;
            			}
            		})
            		
            		
	        		$(".backLogisticsCompany").addClass('hidden')
	        		$(".backLogisticsCode").addClass('hidden')
	        		$("#dialog-returnAddress1").addClass('hidden')
	        		$("#returnAddressType").addClass('hidden')
	        		$(".backAddress").removeClass('hidden')
	        		
	            }else{
	            	htmlCackType = '<option value="1">上门归还</option><option value="2" selected>邮寄</option>';
	            	var htmlAddress ='';
					htmlAddress = `<div class="icon icon-dz"></div>
					<div class="wp100 over-hide"><samp class="fl addressee">收货人：${data.receiver}</samp><samp class="fr mobile">${data.reMobile}</samp></div>
					<div class="detailAddress">收货地址： ${data.reAddress}</div>`;
					
					$("#toUser .toUserName").html('快递');
					$("#orderAddress").html(htmlAddress)
					$("#orderAddress").removeClass('hidden');
					
					htmlReturnAddressType = '<option value="1">平台</option>';
					
	            	$(".backLogisticsCompany").removeClass('hidden')
	        		$(".backLogisticsCode").removeClass('hidden')
	        		$("#dialog-returnAddress2").removeClass('hidden')
	        		$("#returnAddressType").removeClass('hidden')
	        		$(".backAddress").addClass('hidden')
	            }
                
                $("#backType").html(htmlCackType);
            	$("#returnAddressType select").html(htmlReturnAddressType);
            });
    }

	//七牛
	function initUpload(){
		qiniu.getQiniuToken()
			.then((data) =>{
				var token = data.uploadToken;
				qiniu.uploadInit({
					token: token,
					btnId: "uploadBtn",
					containerId: "uploadContainer",
					multi_selection: false,
					showUploadProgress: function(up, file){
						$(".upload-progress").css("width", parseInt(file.percent, 10) + "%");
					},
					fileAdd: function(up, file){
						$(".upload-progress-wrap").show();
					},
					fileUploaded: function(up, url, key){
						$(".upload-progress-wrap").hide().find(".upload-progress").css("width", 0);
						$(".addbackPdf").addClass('hidden')
						$("#backPdf").html("<img src='"+url+"'>");
						$('#backPdf').attr('data-key',key)
					}
				});
			}, () => {})
	}
	
	//归还邮寄地址
	function getReturnAddress(){
		$.when(
			GeneralCtr.getDictList({key:'back_info_person'},'808917'),
			GeneralCtr.getDictList({key:'back_info_address'},'808917'),
			getBackStore()
		).then((data,data2, data3)=>{
			$("#returnAddress .textarea").html(data2.cvalue);
			$("#dialog-returnAddress2 .textarea").html(data.cvalue+' '+data2.cvalue);
			$("#dialog-returnAddress2").attr('data-backAddress',data.cvalue+' '+data2.cvalue);
    	},()=>{})
	}

    //获取物流公司列表
    function getBackLogisticsCompany(){
    	return $.when(
    		GeneralCtr.getDictList({parentKey:'kd_company'},'801907'),
    		GeneralCtr.getDictList({parentKey:'back_kd_company'},'801907'),
    		
    	).then((data, data1)=>{
    		var html = ''
    		data.forEach(function(d, i){
    			html += `<option value='${d.dkey}'>${d.dvalue}</option>`;
    			backLogisticsCompanyDict[d.dkey] = d.dvalue
    		})
    		
    		data1.forEach(function(d, i){
    			expressDict[d.dkey] = d.dvalue
    		})
    		
    		$("#backLogisticsCompany").append(html)
    	},()=>{})
    }
    

	function operateSuccess(){
		setTimeout(function(){
			location.replace('./lease-orders.html')
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
          
		$("#backLogisticsCompany option").eq(0).prop("selected", 'selected');
		$("#backLogisticsCode").val("");
		$("#backAddress").val("");
		
		//自提
		if(takeType == 1){
        	$("#backType option").eq(0).prop("selected", 'selected');
			$("#dialog-returnAddress2").addClass('hidden')
			$("#dialog-returnAddress1").addClass('hidden')
			$("#returnAddressType").addClass('hidden')
			$('#returnAddressType select').val('2')
			
	        $(".backLogisticsCompany").addClass('hidden')
			$(".backLogisticsCode").addClass('hidden')
			$(".backAddress").removeClass('hidden')
		}else{
        	$("#backType option").eq(2).prop("selected", 'selected');
			$("#returnAddressType").removeClass('hidden')
			
			$("#dialog-returnAddress2").removeClass('hidden')
	        $(".backLogisticsCompany").removeClass('hidden')
			$(".backLogisticsCode").removeClass('hidden')
			$(".backAddress").addClass('hidden')
	    	$(".addbackPdf").removeClass('hidden')
			$("#backPdf").html("");
			$('#backPdf').attr('data-key','')
		}
		
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
        
        //删除订单
       $("#deleteBtn").on("click", function() {
            base.confirm('确认删除订单吗？')
                .then(() => {
                    base.showLoading("删除中...");
                    LeaseCtr.deleteOrder(code)
                        .then(() => {
                			base.hideLoading();
                            base.showMsg("操作成功",1000);
                            operateSuccess();
                        });
                }, () => {});
        });
        
        //归还方式选择
        $("#backType").on('change',function(){
        	//上门归还
        	if($(this).val()== 1){
        		
        		$(".backLogisticsCompany").addClass('hidden')
        		$(".backLogisticsCode").addClass('hidden')
        		$("#dialog-returnAddress1").addClass('hidden')
        		$("#dialog-returnAddress2").addClass('hidden')
        		$("#returnAddressType").addClass('hidden')
        		$(".backAddress").removeClass('hidden')
        		
        	//快递
        	}else{
        		$(".backLogisticsCompany").removeClass('hidden')
        		$(".backLogisticsCode").removeClass('hidden')
        		//自提
        		if(takeType==1){
        			
        			$('#returnAddressType select').val('2')
        			$("#dialog-returnAddress1").removeClass('hidden')
        		//邮递
        		}else{
        			
        			$("#dialog-returnAddress2").removeClass('hidden')
        			$('#returnAddressType select').val('1')
        		}
        		$("#returnAddressType").removeClass('hidden')
        		$(".backAddress").addClass('hidden')
        	}
        })
        
        //寄还地址选择
        $("#returnAddressType select").on('change',function(){
        	//平台
        	if($(this).val()== 1){
            	$("#dialog #confirm").attr('data-backAddress', $("#dialog-returnAddress2").attr('data-backAddress'))
        		$("#dialog-returnAddress1").addClass('hidden')
        		$("#dialog-returnAddress2").removeClass('hidden')
        	//自提点
        	}else{
        		
            	$("#dialog #confirm").attr('data-backAddress', $("#dialog-returnAddress1").attr('data-backAddress'))
        		$("#dialog-returnAddress1").removeClass('hidden')
        		$("#dialog-returnAddress2").addClass('hidden')
        	}
        })
        
        //上门归还-自提点
        $("#backStore").on('change',function(){
    		$("#backStoreAddress .textarea").html($('#backStore option:selected').attr('data-address'))
        })
        
        //归还按钮
        var touchFalg = false
        $("#returnBtn").on("click", function() {
        	//takeType 1:自提 , 2: 邮寄
            $("#dialog #confirm").attr('data-code', code)
            $("#dialog #confirm").attr('data-deductType', takeType)
            
            $("#dialog").removeClass('hidden');
            
            touchFalg = true
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        });
        
        //归还弹窗-取消
        $("#dialog #canlce").click(function(){
        	touchFalg = false
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
            dialgoClose();
        })
        
        //归还弹窗-确认
        $("#dialog #confirm").click(function(){
        	var _this = $(this)
        	//上门归还
        	if($("#backType").val()==1){
        		
        		if($("#backAddress").val()=='' && !$("#backAddress").val()){
	        		$(".backAddress .error").removeClass('hidden');
	        	}else{
	        		var param = {
			    		code: $(this).attr('data-code'),
						backType: 1,
			    		backStore: $("#backStore").val()
			    	}
	        		returnOrder(param)
	        	}
        	//邮递
        	}else{
        		if($("#backLogisticsCompany").val()=='' && !$("#backLogisticsCompany").val()){
	        		$(".backLogisticsCompany .error").removeClass('hidden');
	        	}else if($("#backLogisticsCode").val()=='' && !$("#backLogisticsCode").val()){
	        		$(".backLogisticsCode .error").removeClass('hidden');
	        	}else{
	        		var param = {
			    		code: $(this).attr('data-code'),
						backType: 2,
						backLogisticsCode: $("#backLogisticsCode").val(),
						backLogisticsCompany: $("#backLogisticsCompany").val(),
			    		backAddress: _this.attr('data-backAddress'),
						backPdf: $('#backPdf').attr('data-key')
			    	}
	        		if(takeType==2){
	        			param.backAddress=$("#dialog-returnAddress2").attr('data-backAddress');
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
