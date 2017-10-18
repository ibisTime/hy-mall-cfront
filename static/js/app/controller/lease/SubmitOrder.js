define([
    'app/controller/base',
    'app/module/foot',
    'app/interface/GeneralCtr',
    'app/interface/LeaseCtr',
    'app/interface/UserCtr',
    'app/module/AddressList',
    'app/module/expressList',
    'app/module/leaseDate',
    'app/module/scroll',
], function(base, Foot, GeneralCtr, LeaseCtr, UserCtr, AddressList, ExpressList, leaseDate, scroll) {
	var code = base.getUrlParam("code")||'';
	var totalAmount = {
		price1:0,//人民币总价
		price2:0,//积分总价
		deposit:0, //押金
		yunfei:0 // 运费
	};
	var config = {
		productCode: code,
		applyNote: '',
        applyUser: base.getUserId(),
    	receiver: "",
        reMobile: "",
        reAddress: "",
        bookDatetime: "",
        rentDay: "",
        takeStore: "",
        takeType:"",
        quantity: ""
	},
		configYunFei = {
			productCode: '',
			quantity: '',
			address: ''
		};
    var minRentDays = 1,
    	type,
    	myScroll;
     
    if(base.getUserId()){
    	
    	init();
    }else{
    	base.showMsg('登录失效')
    	setTimeout(function(){
    		base.clearSessionUser();
    		base.goLogin()
    	},800)
    }

	function init(){
        base.showLoading(code);
        
    	$.when(
        	getLeaseProductDetail(code),
        	isDefaultAddress(),
        	getLeaseRules()
        )
        
    	$("#toUser").attr('data-toUser',SYS_USER)
    	$("#toUser .toUserName samp").html(SYS_USERNAME)
        base.hideLoading();
        addListener()
	}
	
	//立即下单时获取详情
	function getLeaseProductDetail(c){
		LeaseCtr.getLeaseProductDetail(c).then((data)=>{
			
			minRentDays = data.minRentDays;
			type = data.type;
			var html = '';
			var packsListHtml ='';
			
			data.packsList.forEach(function(d, i){
				packsListHtml += `<div class="packingList"><i class="dot fl"></i><p class="name fl">${d.name}</p><samp class="quantity fr" id='quantity'>*${d.quantity}</samp></div>`
			})
			
			html = `<div class="lease-submit-item"><div class="mall-item">
			    		<a class="mall-item-img fl" style="background-image: url('${base.getImg(data.advPic)}');" href="../lease/lease-detail.html?code=${data.code}"></a>
			    		<div class="mall-item-con fr">
			    			<p class="name">${data.name}</p>
			    			<samp class="slogan">最少租赁时长：<i>${data.minRentDays}</i>天</samp>
			    		</div></div>
    					<div class="packingList-btn" id="packingList">查看包装清单</div>
    				</div>`;
    		
			$(".orderPro-list").html(html);
			$('#dialog .packingList-wrap div').html(packsListHtml);
			
			$("#rent").html(type==JFLEASEPRODUCTTYPE ? base.formatMoney(data.price2)+'积分 /天' : '￥'+base.formatMoney(data.price1)+' /天')
			$("#rentDay").html(data.minRentDays)
			$("#deposit").html('￥'+base.formatMoney(data.deposit))
			$("#dayOverdueFee").html('￥'+base.formatMoney(data.dayOverdueFee))
			$('#weight').html(data.weight+'kg')
			
			totalAmount.deposit = data.deposit;
			totalAmount.price1=data.price1;
			totalAmount.price2=data.price2;
			
			getLeaseProJmAmount(1);
			
			setLeaseDate();
		},()=>{})
	}
	
	//租赁日期选择
	function setLeaseDate(){
		$('#leaseDate').calendarSwitch({
            selectors : {
                sections : "#calendar"
            },
            index : 3,      //展示的月份个数
            animateFunction : "toggle",        //动画效果
            controlDay:false,//是否控制在daysnumber天之内，这个数值的设置前提是总显示天数大于60天
            daysnumber : "60",     //控制天数
            comeColor : "#ffc300",       //起租颜色
            outColor : "#ff5000",      //寄回颜色
            comeoutColor : "#fff6b6",        //起租和寄回之间的颜色
			title: '请选择租赁日期', //标题名称
			startName: '起租', //开始时间名称
			endName: '截止', //开始时间名称
			minDays: minRentDays,//最小天数
            callback :function(n){//回调函数 参数n true：起止日期相差天数大于或等于最少天数  false：起止日期相差天数少于最少天数
            	if(n){
            		var start=$("#startDate").html();
					var end=$("#endDate").html();
					start=start.replace(/-/g,"/");
					var startdate=new Date(start);
					end=end.replace(/-/g,"/");
					var enddate=new Date(end);
				
					var time=enddate.getTime()-startdate.getTime();
					var days=parseInt(time/(1000 * 60 * 60 * 24))+1;
					$("#rentDay").html(days)
					
	    			getLeaseProJmAmount(1);
            	}else{
            		base.showMsg("租赁天数不能少于最小租赁天数")
            	}
            	
            }  , 
            comfireBtn:'.comfire'//确定按钮的class或者id
        });
		
		//最小租期为1天时显示 12日-12日
		if(minRentDays=='1'){
			var b = new Date();
				b=new Date(b.getTime()+24*3600*1000);
	        var ye=b.getFullYear();
	        var mo=b.getMonth()+1;
	        var da=b.getDate();
	        
	        $('#startDate').html(ye+'-'+mo+'-'+da);
	        $('#endDate').html(ye+'-'+mo+'-'+da);
		}else{
			var b=new Date();
				b=new Date(b.getTime()+24*3600*1000);
	        var ye=b.getFullYear();
	        var mo=b.getMonth()+1;
	        var da=b.getDate();
	        $('#startDate').html(ye+'-'+mo+'-'+da);
	          
	        b=new Date(b.getTime()+24*3600*1000*(minRentDays-1));
	        var ye=b.getFullYear();
	        var mo=b.getMonth()+1;
	        var da=b.getDate();
	        $('#endDate').html(ye+'-'+mo+'-'+da);
		}
		
	}
	
	//获取默认地址
	function isDefaultAddress(){
		UserCtr.getAddressList(true,{isDefault:1}).then((data)=>{
			var html = '';
			
			if(data.length){
				html = `<div class="icon icon-dz"></div>
				<div class="wp100 over-hide"><samp class="fl addressee">收货人：${data[0].addressee}</samp><samp class="fr mobile">${data[0].mobile}</samp></div>
				<div class="detailAddress">收货地址： ${data[0].province}  ${data[0].city}  ${data[0].district}  ${data[0].detailAddress}</div>
				<div class="icon icon-more"></div>`
				
				$("#orderAddress").html(html).attr('data-code',data[0].code).removeClass("hidden")
				config.receiver = data[0].addressee;
			    config.reMobile = data[0].mobile;
			    config.reAddress = data[0].province+' '+data[0].city+' '+data[0].district+' '+data[0].detailAddress;
			    
			    configYunFei = {
					productCode: code,
		            quantity: $('.productSpecs-number .sum').html(),
					address:config.reAddress
				};
				
				getYunFei(configYunFei);
			}else{
				$('.no-address').removeClass('hidden');
				$("#orderAddress").addClass('hidden');
			}
			
		},()=>{})
		
	}
	
	//提交订单-立即下单
	function submitOrder(param){
		base.showLoading()
		LeaseCtr.placeOrder(param).then((data)=>{
			base.hideLoading();
			$("#mask").removeClass('hidden');
			base.showMsg('下单成功！',1200)
			
			setTimeout(function(){
				location.href = '../pay/pay.html?code='+data.code+'&type=lease';
			},800)
		},()=>{})
	}
	
	//获取减免金额
	function getLeaseProJmAmount(quantity){
		
		LeaseCtr.getLeaseProJmAmount({
			productCode:code,
			quantity:quantity
		}).then((data)=>{
			$("#jmAmount").html('￥'+base.formatMoney(data.deductAmount)).attr('data-jmAmount',data.deductAmount);
			
			getAmount();
		},()=>{})
	}
	
	//获取金额
	function getAmount(){
		var days = $("#rentDay").html();
		
		var amount = type==JFLEASEPRODUCTTYPE 
				? base.formatMoney(totalAmount.price2*$('.productSpecs-number .sum').html()*days)+'积分 + ￥' + base.formatMoney(totalAmount.deposit*$('.productSpecs-number .sum').html()-$("#jmAmount").attr('data-jmAmount')+totalAmount.yunfei)
				: '￥'+base.formatMoney(totalAmount.price1*$('.productSpecs-number .sum').html()*days+totalAmount.deposit*$('.productSpecs-number .sum').html()-$("#jmAmount").attr('data-jmAmount')+totalAmount.yunfei)
		
		$("#totalAmount").html(amount)
		$("#totalAmount2").html(amount)
		
//		var amount1 = type==JFLEASEPRODUCTTYPE 
//				? base.formatMoney(totalAmount.price2*$('.productSpecs-number .sum').html()*days)+'积分'
//				: '￥'+base.formatMoney(totalAmount.price1*$('.productSpecs-number .sum').html()*days)
//		$("#totalAmount3").html('租金：'+ amount1 +' 押金：￥'+base.formatMoney(totalAmount.deposit*$('.productSpecs-number .sum').html()-$("#jmAmount").attr('data-jmAmount')))
		
	}
	
	//获取运费
	function getYunFei(params){
		if($("#toUser").attr('data-toUser')!=SYS_USER){
			$('.yunfeiWrap').addClass('hidden')
			totalAmount.yunfei = 0;
			getAmount();
		}else{
			LeaseCtr.getYunfei(params).then((data)=>{
				totalAmount.yunfei = data.expressFee
				$('.yunfeiWrap').removeClass('hidden')
				$("#yunfei").html('￥'+base.formatMoney(data.expressFee));
				
				getAmount();
			},()=>{})
		}
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
					
					configYunFei.productCode = code,
			        configYunFei.quantity = $('.productSpecs-number .sum').html();
					configYunFei.address = config.reAddress;
					getYunFei(configYunFei);
					
					$("#orderAddress").html(html).attr('data-code',dCode)
				    $("#orderAddress").removeClass('hidden')
	            	$('.no-address').addClass('hidden')
	            	
            	}else{
            		config.receiver = '';
				    config.reMobile = '';
				    config.reAddress = '';
				    
				    $("#orderAddress").addClass('hidden');
	            	$('.no-address').removeClass('hidden');
            	}
            	
            }
        });
		AddressList.showCont({
			code: c
		});
	}
	
	//获取租赁规则说明
	function getLeaseRules(){
		return GeneralCtr.getUserSysConfig('rent_rule',true).then((data)=>{
			$("#leaseRuleDialog-content div").html(data.cvalue)
		})
	}
	
	
	function addListener(){
       
		//地址
		$("#orderAddress").click(function(){
			addressListAddCont($(this).attr('data-code'))
		})
		
		//未添加地址
		$('.no-address').click(function(){
			addressListAddCont($(this).attr('data-code'))
		})
		
		//提交
		$("#subBtn").click(function(){
			
			config.applyNote = $("#applyNote").val();
			config.bookDatetime = $("#startDate").html();
			config.rentDay = $("#rentDay").html();
			config.quantity = $('.productSpecs-number .sum').html()
			config.takeStore = $("#toUser").attr('data-toUser')
			
			if(config.takeStore == SYS_USER){
				config.takeType = '2'
				config.takeStore = '';
			}else{
				config.takeType = '1';
			}
			
			if($("#toUser").attr('data-toUser')==SYS_USER && !config.receiver){
				base.showMsg('请选择地址');
			}else{
				submitOrder(config)
			}
				
		})
		
		ExpressList.addCont({
            success: function(res) {
				base.showLoading()
            	if(res.toUser){
            		$("#toUser").attr('data-toUser',res.toUser)
            		
            		//快递
            		if(res.toUser==SYS_USER){
            			
            			$("#toUser").find('.toUserName').children('samp').html(res.toUserName)
            			$('#toStoreAddress').addClass('hidden').html('')
            			$('#orderAddress').removeClass('hidden')
            			
            			if($('#orderAddress').html()){
							$('.no-address').addClass('hidden');
            			}else{
							$('.no-address').removeClass('hidden');
            			}
            			
            			if($("#toUser").attr('data-toUser')==SYS_USER && !config.receiver){
							base.hideLoading()
							base.showMsg('请选择地址')
						}else{
						    configYunFei.productCode = code,
					        configYunFei.quantity = $('.productSpecs-number .sum').html();
	            			
							getYunFei(configYunFei);
							base.hideLoading()
						}
            		//自提
            		}else{
						var html = `<div class="icon icon-dz"></div>
						<div class="wp100 over-hide"><samp class="fl addressee">提货点：${res.toUserName}</samp></div>
						<div class="detailAddress">提货点地址： ${res.toUserAddress}</div>`
						
            			$("#toUser").find('.toUserName').children('samp').html("自提")
            			
						$('.no-address').addClass('hidden');
						$("#toStoreAddress").html(html).removeClass('hidden')
            			$('#orderAddress').addClass('hidden')
            			
            			
						getYunFei(configYunFei);
						base.hideLoading()
            		}
            	}else{
					base.hideLoading();
            	}
            }
        });
		
		//配送方式
		$("#toUser").click(function(){
        
			ExpressList.showCont();
		})
        
        //包装清单弹窗-显示
		var touchFalg=false;
        $(".orderPro-list").on('click','#packingList',function(){
        	$("#dialog").removeClass('hidden');
        	touchFalg = true
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        })
        
        //包装清单弹窗-关闭
        $("#dialog .close").click(function(){
        	$("#dialog").addClass('hidden')
        	touchFalg = false;
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        })
        
        
       //购买数量 减
		$('.productSpecs-number .subt').click(function(){
			var sum = +$('.productSpecs-number .sum').html()
			if(sum>1){
				sum--
			}
			$('.productSpecs-number .sum').html(sum);
			
			configYunFei.quantity = $('.productSpecs-number .sum').html();
			$.when(
				getYunFei(configYunFei),
				getLeaseProJmAmount($('.productSpecs-number .sum').html())
			)
			
		})
		
		//购买数量 加
		$('.productSpecs-number .add').click(function(){
			var sum = +$('.productSpecs-number .sum').html()
//			if(sum<$(".quantity").attr('data-quantity')){//库存
				sum++
//			}
			$('.productSpecs-number .sum').html(sum);
			
			configYunFei.quantity = $('.productSpecs-number .sum').html();
			$.when(
				getYunFei(configYunFei),
				getLeaseProJmAmount($('.productSpecs-number .sum').html())
			)
		})
		
        //包装清单弹窗-关闭
        $("#leaseRuleDialog .close").click(function(){
        	$("#leaseRuleDialog").addClass('hidden')
        	touchFalg = false;
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        })
        
        //租赁规则说明弹窗-显示
        var touchFalg=false;
		$("#leaseRuleBtn").click(function(){
        	$("#leaseRuleDialog").removeClass('hidden')
        	touchFalg = true
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
			myScroll.myScroll.refresh()
        })
       
        //租赁规则说明弹窗-关闭 
        $("#leaseRuleDialog .close").click(function(){
        	$('#leaseRuleDialog').addClass('hidden');
        	touchFalg = false
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        })
		
		myScroll = scroll.getInstance().getScrollByParam({
            id: 'leaseRuleDialog-content',
            param: {
                eventPassthrough: true,
                snap: true,
                hideScrollbar: true,
                hScroll: true,
                hScrollbar: false,
                vScrollbar: false
            }
        });
		
	}
	
})
