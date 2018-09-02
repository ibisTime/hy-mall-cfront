define([
    'app/controller/base',
    'app/module/validate',
    'app/module/qiniu',
    'app/interface/MallCtr',
    'app/util/dict',
    'app/interface/GeneralCtr'
], function(base, Validate, qiniu, MallCtr, Dict, GeneralCtr) {
    var code = base.getUrlParam("code"),
        orderStatus = Dict.get("mallOrderStatus"),
    	expressDict = {},
    	productOrderStatus={},
    	productReturnStatus = {
    		"1": "退货申请中",
    		"2": "待发货",
    		"3": "退货失败",
    		"4": "已发货",
    		"5": "已退款",
    		"6": "不可退货"
    	};

    init();
    
    function init(){
        addListener();
        base.showLoading();
        	productOrderStatusDict().then(loadDate,loadDate)
    }
    
    function loadDate(){
    	$.when(
        	getReturnReason(),
        	getReturnAddress(),
        	getBackLogisticsCompany(),
        	initUpload()
        ).then(()=>{
        	getOrderDetail();
        })
    }
    
    // 获取订单详情商品状态数据字典
    function productOrderStatusDict(){
    	return GeneralCtr.getDictList({parentKey:'product_order_status'},'801907').then((data)=>{
    		data.forEach(v => {
    			productOrderStatus[v.dkey] = v.dvalue;
    		})
    	},()=>{})
    }
    
    //获取物流公司列表
    function getBackLogisticsCompany(){
    	return GeneralCtr.getDictList({parentKey:'kd_company'},'801907').then((data)=>{
    		var html = ''
    		data.forEach(function(d, i){
    			expressDict[d.dkey] = d.dvalue;
    			html += `<option value='${d.dkey}'>${d.dvalue}</option>`;
    		})
    		$("#logisticsCompany").html(html)
    	},()=>{})
    }
    
    //获取退货原因
    function getReturnReason(){
    	GeneralCtr.getDictList({parentKey:'return_reason'},'801907').then((data)=>{
    		var html = ''
    		data.forEach(function(d, i){
    			html += `<option value='${d.dkey}'>${d.dvalue}</option>`;
    		})
    		
    		$("#returnReason").append(html)
    	},()=>{})
    }
    
    //归还邮寄地址
	function getReturnAddress(){
		$.when(
			GeneralCtr.getDictList({key:'back_info_person'},'808917'),
			GeneralCtr.getDictList({key:'back_info_address'},'808917')
		).then((data,data2, data3)=>{
			$("#returnAddress .textarea").html(data.cvalue+'<br/>'+data2.cvalue);
    	},()=>{})
	}
    
    //商品详情
    function getOrderDetail() {
        MallCtr.getOrderDetail(code, true)
            .then((data) => {
                base.hideLoading();
                var productReturnFlag = false;
                
				//商品详情
                var htmlPro = '';
				data.productOrderList.forEach(function(d, i){
					var returnHtml = '';
					if(data.status == "4" || data.status == "5" ){
						var btnClass='';
						
						// 可退货
						if(d.status == '0'){
							btnClass = 'applyReturn-goods';
						// 待发货
						} else if(d.status == '2'){
							btnClass = 'deliver-goods';
						} 
						
						// 是否显示寄还地址
						if(productReturnStatus[d.status] && !productReturnFlag) {
							productReturnFlag = true;
						}
						
						returnHtml = `<div class="wp100 return-wrap"><button class=" fr am-button am-button-small am-button-red ${btnClass}" data-code="${d.code}">${productOrderStatus[d.status]}</button></div>`
					}
					
					var price = d.price2 ? base.formatMoney(d.price2)+'积分' : '￥'+base.formatMoney(d.price1);
					
					htmlPro += `<div class="mall-item"><a class="wp100" href="../mall/mallDetail.html?code=${d.productCode}&gCode=${data.groupCode ? data.groupCode : ''}">
		    		<div class="mall-item-img fl" style="background-image: url('${base.getImg(d.product.advPic)}');"></div>
		    		<div class="mall-item-con fr">
		    			<p class="name">${d.product.name}</p>
		    			<samp class="slogan">${d.productSpecsName}</samp>
		    			<div class="price wp100">
		    				<samp class="samp1 fl">${price}</samp>
		    				<samp class="samp2 fr">x${d.quantity}</samp>
		    			</div></div></a>
		    			${returnHtml}
		    			</div>`;
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
					<div class="wp100 over-hide"><samp class="fl addressee">物流公司：${expressDict[data.logisticsCompany]}</samp></div>
					<div class="wp100 over-hide"><samp class="fl addressee">物流单号：${data.logisticsCode}</samp></div>`;
					
					$("#expressDelivery").html(htmlExpress)
					$("#expressDelivery").removeClass('hidden')
				}
				
				//运费
				if(data.yunfei){
					$("#yunfei").html('￥'+base.formatMoney(data.yunfei));
					$(".yunfeiWrap").removeClass('hidden')
				}
				
				//买家嘱托
				$("#applyNote").html(data.applyNote?data.applyNote:'无')
				
				
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
					if (data.payAmount3 != "0" && data.payAmount1 != "0" && data.payAmount2 != "0") {
		                payAmount = "￥" + base.formatMoney(data.payAmount1) +'+'+ base.formatMoney(data.payAmount2) + "积分+" + base.formatMoney(data.payAmount3)+"小金库"
		            } else if (data.payAmount3 == "0" && data.payAmount1 != "0" && data.payAmount2 != "0") {
		                payAmount = "￥" + base.formatMoney(data.payAmount1) +'+'+base.formatMoney(data.payAmount2) + "积分";
		            } else if (data.payAmount3 != "0" && data.payAmount1 != "0" && data.payAmount2 == "0") {
		                payAmount = "￥" + base.formatMoney(data.payAmount1) +'+'+ base.formatMoney(data.payAmount3) + "小金库";
		            } else if (data.payAmount3 != "0" && data.payAmount1 == "0" && data.payAmount2 != "0") {
		                payAmount = base.formatMoney(data.payAmount2) + "积分+" + base.formatMoney(data.payAmount3) + "小金库";
		            } else if (data.payAmount3 == "0" && data.payAmount1 == "0" && data.payAmount2 != "0") {
		                payAmount = base.formatMoney(data.payAmount2)+ "积分";
		            } else if (data.payAmount3 != "0" && data.payAmount1 == "0" && data.payAmount2 == "0") {
		                payAmount = base.formatMoney(data.payAmount3) + "小金库";
		            } else if (data.payAmount3 == "0" && data.payAmount1 != "0" && data.payAmount2 == "0") {
		                payAmount = "￥" + base.formatMoney(data.payAmount1);
		            }
					amountHtml=`<p>订单总价：${totalAmount}</p>
								<p>实付金额：${payAmount}</p>
								${dkHtml}`
				}
				
				htmlOrder = `<p>订单号：${data.code}</p>
					<p>订单状态：${orderStatus[data.status]}</p>
					<p>下单时间：${base.formatDate(data.applyDatetime,'yyyy-MM-dd hh:mm:ss')}</p>
					${amountHtml}`;
				
				if(data.status == "3" ||data.status == "4" || data.status == "5"){
					htmlOrder += `<p>发货时间：${base.formatDate(data.deliveryDatetime,'yyyy-MM-dd hh:mm:ss')}</p>`
				}
				if(data.status == "4" || data.status == "5"){
					htmlOrder += `<p>确认收货时间：${base.formatDate(data.signDatetime,'yyyy-MM-dd hh:mm:ss')}</p>`
				}
				
				$("#orderInfo").html(htmlOrder);
				
				// 寄还地址
				if(productReturnFlag){
					$("#returnAddress").removeClass('hidden');
				}
				
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
					
				//待评价
				}else if(data.status=='4'){
					$('.mallBottom').removeClass('hidden')
					$("#commentBtn").removeClass('hidden')
				
				//用户取消 删除订单按钮
				}else if(data.status=='91'){
					$('.mallBottom').removeClass('hidden')
					$("#deleteBtn").removeClass('hidden')
				}
            });
    }

	//操作成功
	function operateSuccess(){
		setTimeout(function(){
			location.reload(true)
		}, 800)
	}
	
	//七牛初始化图片
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
						$("#applyReturnDialog .upload-progress").css("width", parseInt(file.percent, 10) + "%");
					},
					fileAdd: function(up, file){
						$("#applyReturnDialog .upload-progress-wrap").show();
					},
					fileUploaded: function(up, url, key){
						$("#applyReturnDialog .upload-progress-wrap").hide().find(".upload-progress").css("width", 0);
						$("#applyReturnDialog .addbackPdf").addClass('hidden')
						$("#returnPdf").html("<img src='"+url+"'>");
						$('#returnPdf').attr('data-key',key)
					}
				});
			}, () => {})
		qiniu.getQiniuToken()
			.then((data) =>{
				var token = data.uploadToken;
				qiniu.uploadInit({
					token: token,
					btnId: "uploadBtnD",
					containerId: "uploadContainerD",
					multi_selection: false,
					showUploadProgress: function(up, file){
						$("#deliverDialog .upload-progress").css("width", parseInt(file.percent, 10) + "%");
					},
					fileAdd: function(up, file){
						$("#deliverDialog .upload-progress-wrap").show();
					},
					fileUploaded: function(up, url, key){
						$("#deliverDialog .upload-progress-wrap").hide().find(".upload-progress").css("width", 0);
						$("#deliverDialog .addbackPdf").addClass('hidden')
						$("#backPdf").html("<img src='"+url+"'>");
						$('#backPdf').attr('data-key',key)
					}
				});
			}, () => {})
	}
	
	//申请退货弹窗-关闭
	function applyReturnDialogClose(){
    	$("#applyReturnDialog").addClass('hidden');
    	$("#applyReturnDialog .confirm").attr("data-code", '');
    	$("#applyReturnForm").get(0).reset();
    	$("#applyReturnDialog .addbackPdf").removeClass('hidden')
		$("#returnPdf").html("");
		$('#returnPdf').attr('data-key','')
	}
	
	// 申请退款
	function applyReturnProduct(params){
		return MallCtr.applyReturnProduct(params).then(()=>{
			applyReturnDialogClose();
			base.hideLoading();
			base.showMsg('操作成功！')
			
			setTimeout(function(){
				location.reload(true);
			},800)
		}, base.hideLoading)
	}
	
	// 退货信息弹窗 - 关闭
	function deliverDialogClose(){
    	$("#deliverDialog").addClass('hidden');
    	$("#applyReturnDialog .confirm").attr("data-code", '');
    	$("#applyReturnForm").get(0).reset();
    	$("#deliverDialog .addbackPdf").removeClass('hidden')
		$("#backPdf").html("");
		$('#backPdf').attr('data-key','')
		$("#sendDatetime").html("");
	}
	
	// 填写退货信息
	function deliverReturnProduct(params){
		return MallCtr.deliverReturnProduct(params).then(()=>{
			deliverDialogClose();
			base.hideLoading();
			base.showMsg('操作成功！')
			
			setTimeout(function(){
				location.reload(true);
			},800)
		}, base.hideLoading)
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
			location.href='./order-comment.html?type=mall&code='+code
        });
        
        //删除订单
       $("#deleteBtn").on("click", function() {
            base.confirm('确认删除订单吗？')
                .then(() => {
                    base.showLoading("删除中...");
                    MallCtr.deleteOrder(code)
                        .then(() => {
                			base.hideLoading();
                            base.showMsg("操作成功",1000);
                            operateSuccess();
                        });
                }, () => {});
        });
        
		var touchFalg=false;
		
		
		//申请退货---- start
        var _applyReturnForm = $("#applyReturnForm");
        _applyReturnForm.validate({
            'rules': {
                returnReason: {
                    required: true
                },
                returnNote: {
                }
            },
            onkeyup: false
        });
        
        //申请退货弹窗-取消
        $("#applyReturnDialog .canlce").click(function(){
        	touchFalg = false
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        	
            applyReturnDialogClose();
        })
        
        //申请退货弹窗-确定
        $("#applyReturnDialog .confirm").click(function(){
        	var productCode =$(this).attr('data-code');
        	var params = _applyReturnForm.serializeObject();
        	if(_applyReturnForm.valid()){
        		params.returnPdf =  $('#returnPdf').attr('data-key');
        		params.code = productCode;
        		base.showLoading();
        		applyReturnProduct(params);
        	}
        })
        //申请退货---- end
        
        //申请退货按钮
        $('.orderPro-list').on('click', '.applyReturn-goods', function(){
        	$("#applyReturnDialog .confirm").attr("data-code", $(this).attr("data-code"));
    		$("#applyReturnDialog").removeClass('hidden');
    		
    		touchFalg = true
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        })
        
        //待发货按钮
        $('.orderPro-list').on('click', '.deliver-goods', function(){
        	$("#deliverDialog .confirm").attr("data-code", $(this).attr("data-code"));
    		$("#deliverDialog").removeClass('hidden');
    		
    		touchFalg = true
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        })
        
        //填写退货信息 --- start
        var startDate = {
            elem: '#sendDatetime',
            format: 'YYYY-MM-DD hh:mm:ss',
            isclear: true, //是否显示清空
            istoday: false,
            istime: true,
            choose: function(datas) {
            	if(datas){
            		var d = new Date(datas);
	                d.setDate(d.getDate());
	                d = base.formatDate(d,'yyyy-MM-dd hh:mm:ss');
	                $("#sendDatetime").text(d);
                	$(".sendDatetime-wrap .error").addClass('hidden');
            	} else {
	                $("#sendDatetime").text('');
                	$(".sendDatetime-wrap .error").removeClass('hidden');
            	}
            }
        };
        
        setTimeout(function(){
        	laydate(startDate);
        	$("#sendDatetime").text(base.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'))
        },0)
        
        var _deliverReturnForm = $("#deliverReturnForm");
        _deliverReturnForm.validate({
            'rules': {
                logisticsCompany: {
                    required: true
                },
                logisticsCode: {
                    required: true
                }
            },
            onkeyup: false
        });
        
        
        //退货信息 弹窗-取消
        $("#deliverDialog .canlce").click(function(){
        	touchFalg = false
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        	
            deliverDialogClose();
        })
        
        //申请退货弹窗-确定
        $("#deliverDialog .confirm").click(function(){
        	var productCode =$(this).attr('data-code');
        	var params = _deliverReturnForm.serializeObject();
        	if(_deliverReturnForm.valid()){
        		if(!$("#sendDatetime").text() || $("#sendDatetime").text() == ''){
        			$(".sendDatetime-wrap .error").removeClass('hidden');
        			return ;
        		}
        		params.logisticsPdf =  $('#backPdf').attr('data-key');
        		params.code = productCode;
        		params.sendDatetime = $("#sendDatetime").text();
        		base.showLoading();
        		deliverReturnProduct(params);
        	}
        })
        
        //填写退货信息 --- end
    }
});
