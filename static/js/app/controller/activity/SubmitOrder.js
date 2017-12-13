define([
    'app/controller/base',
    'app/module/validate',
    'app/interface/UserCtr',
    'app/interface/ActivityStr',
    'app/interface/MallCtr',
    'app/interface/LeaseCtr',
    'app/module/bindMobile',
    'app/module/AddressList',
    'app/module/ActivityChooseMallList',
    'app/module/ActivityChooseLeaseList',
], function(base, Validate, UserCtr, ActivityStr, MallCtr, LeaseCtr, BindMobile, AddressList, ActivityChooseMallList, ActivityChooseLeaseList) {
	var type = base.getUrlParam("type");//type=1，直接报名； type=2，选择装备后报名； 
	var code = base.getUrlParam("code");
	var totalAmount = {
		mallAmount:0,//商品金额
		leaseAmount:0,//租赁金额
		actAmount:0,//活动金额
		deposit:0, //押金
		yunfei:0 // 运费
	};
	var config = {
		actCode: code,
    	receiver: "",
        reMobile: "",
        reAddress: "",
        applyNote: ""
	};
	var isBindMobile= false; //是否绑定手机号
	var amountType = 0;//收费类型 ： 0=免费， 1=收费
	
    init();

	function init(){
		//有选择装备
		if(type==2){
			$("#chooseMallWrap").removeClass("hidden")
			$("#chooseLeaseWrap").removeClass("hidden")
			$("#chooseAddressWrap").removeClass("hidden")
		}
		base.showLoading()
		$.when(
			getActivityDetail(),
			getUserInfo()
		).then(base.hideLoading)
		
		addListener()
	}
	
	//获取用户详情 查看是否绑定手机号
	function getUserInfo() {
		return UserCtr.getUser().then(function(data) {
			if(data.mobile){
				isBindMobile = true;
			}else{
				isBindMobile = false
			}
		});
	}
	
	//获取详情
	function getActivityDetail(){
		return ActivityStr.getActivityDetail(code).then((data)=>{
			
			$("#activityWrap .pic").css({"background-image":"url('"+base.getImg(data.advPic)+"')"})
	        $("#activityWrap .content .name").html(data.name)
	        $("#activityWrap .info .address").text(data.placeDest)
	        $("#activityWrap .info .data").text(base.formatDate(data.startDatetime, "yyyy-MM-dd")+"至"+base.formatDate(data.endDatetime, "yyyy-MM-dd"))
			$("#activityWrap .care samp").text(data.groupNum+'人成行')
			$("#activityWrap #price").html('￥'+base.formatMoney(data.amount))
			$("#activityWrap #price").attr('data-prict',data.amount)
			
			getAmount();
			
			base.hideLoading()
		}, base.hideLoading)
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
				    $("#orderAddress").html("").attr('data-code',"");
            	}
            	
            	getAmount();
            }
        });
		AddressList.showCont({
			code: c
		});
	}
	
	//商品列表
	function mallBuildHtml(item){
		
		return `<div class="mall-item chooseList-wrap" data-code="${item.code}" data-speccode="${item.speccode}"  data-quantity="${item.quantity}" data-price="${item.price}" >
					<div class="mall-item-img fl" style="background-image: url('${base.getImg(item.advPic)}');"></div>
					<div class="mall-item-con fl">
						<p class="name">${item.name}</p>
						<samp class="slogan">${item.productSpecs}</samp>
						<div class="price">
							<samp class="samp1">￥${base.formatMoney(item.price)}</samp>
							<samp class="samp2">X${item.quantity}</samp>
						</div>
					</div>
					<div class="deleteWrap fl"><div class="delete chooseList-delete"><div></div>
				</div>`
	}
	//租赁列表
	function leaseBuildHtml(item){
		
		return `<div class="mall-item chooseList-wrap" data-code="${item.code}" data-bookDatetime="${item.startDate}" 
					data-quantity="${item.quantity}" data-rentDay="${item.rentDay}"  data-price="${item.price}"  data-deposit="${item.deposit}" >
					<div class="mall-item-img fl" style="background-image: url('${base.getImg(item.advPic)}');"></div>
					<div class="mall-item-con fl">
						<p class="name">${item.name}</p>
						<samp class="slogan t_999_i rentDays">租期：${item.rentDay}&nbsp;&nbsp;&nbsp;&nbsp;数量：X${item.quantity}</samp>
						<samp class="slogan t_999_i data">租赁日期：${item.startDate}至${item.endDate}</samp>
						<div class="price">
							<samp class="samp1">￥${base.formatMoney(item.price)}</samp>
							<samp class="samp2">(含押金:￥${base.formatMoney(item.deposit)})</samp>
							
						</div>
					</div>
					<div class="deleteWrap fl"><div class="delete chooseList-delete"><div></div>
				</div>`
	}
	
	//获取金额
	function getAmount(){
		var amount = 0; //总金额
		var actAmount = $("#activityWrap #price").attr('data-prict');//活动金额
		
		//直接报名
		if(type==1){
			amount = actAmount;
			
			amount==0? amountType = 0 : amountType = 1;//收费类型
			
			$("#totalAmount").text('￥'+base.formatMoney(amount))
		
		//选择装备报名
		}else{
			var params ={
				actCode: code,
				reAddress: config.reAddress
			}
			var prodList = [],
				rprodList= [];
				
	        //商品
			$("#actChoose-mall .chooseList-wrap").each(function(){
				var tmpl = {
					productSpecsCode: $(this).attr("data-speccode"),
					quantity: $(this).attr("data-quantity")
				}
				prodList.push(tmpl)
			})
			//租赁
			$("#actChoose-lease .chooseList-wrap").each(function(){
				var tmpl = {
					productCode: $(this).attr("data-code"),
					quantity: $(this).attr("data-quantity"),
					bookDatetime: $(this).attr("data-bookDatetime"),
					rentDay: $(this).attr("data-rentDay")
				}
				rprodList.push(tmpl)
			})
	        
			params.prodList = prodList;
			params.rprodList = rprodList;
			
			getYunfei(params);
		}
		
	}
	
	//获取运费
	function getYunfei(params){
		base.showLoading()
		return ActivityStr.getYunfei(params).then((data)=>{
			var yunfei = data.totalYunfei ? "<i>(含运费：￥"+base.formatMoney(data.totalYunfei)+")</i>" : '';
			$("#totalAmount").html('￥'+base.formatMoney(data.totalAmount)+yunfei)
			base.hideLoading()
		}, base.hideLoading)
	}
	
	//提交订单
	function submitOrder(params){
		return ActivityStr.placeOrder(params).then((data)=>{
			
			//免费
			if(amountType==0 && type!=2){
				base.showMsg("报名成功！")
				setTimeout(() => {
                    location.replace("../user/user.html");
                }, 500);
			//收费
			}else{
				base.showMsg("提交成功！")
				setTimeout(() => {
				location.href = '../pay/pay.html?code='+data.code+'&type=activity';
                }, 500);
			}
			
			base.hideLoading()
		}, base.hideLoading)
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
        
//      $("#activityWrap .activity-item a").click(function(){
//      	location.href = "../activity/activity-detail.html?code="+code
//      })
        
        //选择商品面板
		ActivityChooseMallList.addCont({
        	success: function(proList) {
        		if(proList.length){
        			var html = ""
        			proList.forEach(function(item){
        				
        				html+= mallBuildHtml(item)
        			})
        			$("#actChoose-mall").append(html);
        			getAmount();
        		}
        	}
        });
        
        //选择租赁面板
		ActivityChooseLeaseList.addCont({
        	success: function(proList) {
        		if(proList.length){
        			var html = ""
        			proList.forEach(function(item){
        				
        				html+= leaseBuildHtml(item)
        			})
        			$("#actChoose-lease").append(html);
        			getAmount();
        		}
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
        
        //删除选择产品
        $(".actChoose-mall").on("click",".chooseList-delete",function(){
        	var _this = $(this)
        	base.confirm("确定删除？").then(()=>{
        		_this.parents(".chooseList-wrap").remove();
        		getAmount();
        	},()=>{})
        })
        
		var _formWrapper = $("#formWrapper");
        _formWrapper.validate({
            'rules': {
                outName: {
                    required: true,
                },
                realName: {
                    required: true,
                    chinese: true
                },
                idNo: {
                    required: true,
                    isIdCardNo: true
                },
                mobile: {
                    required: true,
                    mobile: true
                },
            },
            onkeyup: false
        });
		
		//提交
		$("#subBtn").click(function(){
			if(!isBindMobile){
				BindMobile.showMobileCont();
			}else{
				if (_formWrapper.valid()) {
					var params = {};
		    		var enrollList = [];
		    		enrollList.push($('#formWrapper').serializeObject());
		    		
		    		config.enrollList = enrollList;
		    		config.applyNote = $("#applyNote").val();
		    		
		    		//直接报名
		    		if(type==1){
		    			submitOrder(config)
		    		//选择装备报名
		    		}else if(type==2){
		    			
		    			var prodList = [],
		    				rprodList= [];
		    				
				        //商品
						$("#actChoose-mall .chooseList-wrap").each(function(){
							var tmpl = {
								productSpecsCode: $(this).attr("data-speccode"),
								quantity: $(this).attr("data-quantity")
							}
							prodList.push(tmpl)
						})
						//租赁
						$("#actChoose-lease .chooseList-wrap").each(function(){
							var tmpl = {
								productCode: $(this).attr("data-code"),
								quantity: $(this).attr("data-quantity"),
								bookDatetime: $(this).attr("data-bookDatetime"),
								rentDay: $(this).attr("data-rentDay")
							}
							rprodList.push(tmpl)
						})
				        
		    			config.prodList = prodList;
		    			config.rprodList = rprodList;
		    			
		    			if(config.prodList.length&&!config.receiver){
		    				base.showMsg("请选择地址")
		    			}else if(config.rprodList.length&&!config.receiver){
		    				base.showMsg("请选择地址")
		    			}else{
		    				submitOrder(config);
		    			}
					};
					
				}
			}
		})
	}
})
