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
    'app/module/expressList',
], function(base, Validate, UserCtr, ActivityStr, MallCtr, LeaseCtr, BindMobile, AddressList, ActivityChooseMallList, ActivityChooseLeaseList, ExpressList) {
	var type = base.getUrlParam("type");//type=1，直接报名； type=2，选择装备后报名； 
	var code = base.getUrlParam("code");
	var totalAmount = {
		mallAmount:0,//商品金额
		leaseAmount:0,//租赁金额
		actAmount:0,//活动金额
		deposit:0, //押金
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
	var isUserInfo = false;//是否有用户信息(outName,realName,idNo,mobile)
	var isWxGroupQrcode = '0'; // 是否有领队微信群二维码
	// form 校验
	var rules={
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
        gender: {
            required: true,
        }
	}
	
	// 用户报名信息 form
	var _formWrapper = $("#formWrapper");
	
	// 同行好友弹窗form
	var _enrollForm = $("#enrollForm");
	
	// 存储自定义字段
	var customKey = {};
	
	// 同行好友数据
	var enrollListTmpl = [];
	
	// 报名人数
	var peopleNum = 1;
	
    init();

	function init(){
		//有选择装备
		if(type==2){
			$("#chooseMallWrap").removeClass("hidden")
			$("#chooseLeaseWrap").removeClass("hidden")
			$("#toUser").removeClass("hidden")
			$("#chooseAddressWrap").removeClass("hidden")
			$("#toUser").attr('data-toUser',SYS_USER)
    		$("#toUser .toUserName samp").html(SYS_USERNAME)
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
			if(data.outName&&data.mobile&&data.idNo&&data.realName){
				isUserInfo = true
			}else {
				isUserInfo = false
			}
			if(data.outName){
				$("#outName").val(data.outName);
				$("#outName").parents(".form-item").find('.inputMask').removeClass("hidden");
			}
			if(data.mobile){
				$("#mobile").val(data.mobile)
				$("#mobile").parents(".form-item").find('.inputMask').removeClass("hidden");
			}
			if(data.idNo){
				$("#idNo").val(data.idNo)
				$("#idNo").parents(".form-item").find('.inputMask').removeClass("hidden");
			}
			if(data.realName){
				$("#realName").val(data.realName)
				$("#realName").parents(".form-item").find('.inputMask').removeClass("hidden");
			}
			if(data.gender){
				$("#gender").val(data.gender).trigger("change");
				$("#gender").parents(".form-item").find('.inputMask').removeClass("hidden");
			}
		});
	}
	
	//获取详情
	function getActivityDetail(){
		return ActivityStr.getActivityDetail(code).then((data)=>{
			
			amountType = data.amountType;
			
			if(amountType=='1'){
				$("#amountType1").removeClass("hidden")
			}
			
			$("#activityWrap .pic").css({"background-image":"url('"+base.getImg(data.advPic)+"')"})
	        $("#activityWrap .content .name").html(data.name)
	        $("#activityWrap .info .address").text(data.placeDest)
	        $("#activityWrap .info .data").text(base.formatDate(data.startDatetime, "yyyy-MM-dd")+"至"+base.formatDate(data.endDatetime, "yyyy-MM-dd"))
			$("#activityWrap .care samp").text(data.groupNum+'人成行')
			$("#activityWrap #price").html('￥'+base.formatMoney(data.amount))
			$("#activityWrap #price").attr('data-prict',data.amount)
			
			getAmount();
			
			// 是否有领队二维码
			if(data.wxGroupQrcode){
				isWxGroupQrcode = '1';
			}
			
			// 自定义字段
			var html1 = ''; // 当前用户
			var html2 = ''; // 同行好友
			
			if(data.customKey1){
				rules = {
					...rules,
					customKey1: {
            			required: true
					}
				}
				html1 += `<div class="form-item b_e_b">
			                <div class="am-flexbox">
			                    <span class="item-title">${data.customKey1}</span>
			                    <input type="text" placeholder="请输入${data.customKey1}" id="customKey1" name="customKey1" class="input-item">
			                </div>
			            </div>`;
			    html2 += `<div class="wrap">
                			<samp class="fl tit">${data.customKey1}：</samp>
                			<div class="fr conWrap">
                				<input type="text" class="wp100 con" placeholder="请输入${data.customKey1}" id="enroll-customKey1" name="customKey1" />
                			</div>
                		</div>`;
			}
			if(data.customKey2){
				rules = {
					...rules,
					customKey2: {
            			required: true
					}
				}
				
				html1 +=`<div class="form-item b_e_b">
			                <div class="am-flexbox">
			                    <span class="item-title">${data.customKey2}</span>
			                    <input type="text" placeholder="请输入${data.customKey2}" id="customKey2" name="customKey2" class="input-item">
			                </div>
			            </div>`;
			    html2 += `<div class="wrap">
                			<samp class="fl tit">${data.customKey2}：</samp>
                			<div class="fr conWrap">
                				<input type="text" class="wp100 con" placeholder="请输入${data.customKey2}" id="enroll-customKey2" name="customKey2" />
                			</div>
                		</div>`;
			}
			if(data.customKey3){
				rules = {
					...rules,
					customKey3: {
            			required: true
					}
				}
				
				html1 +=`<div class="form-item b_e_b">
			                <div class="am-flexbox">
			                    <span class="item-title">${data.customKey3}</span>
			                    <input type="text" placeholder="请输入${data.customKey3}" id="customKey3" name="customKey3" class="input-item">
			                </div>
			            </div>`;
			    html2 += `<div class="wrap">
                			<samp class="fl tit">${data.customKey3}：</samp>
                			<div class="fr conWrap">
                				<input type="text" class="wp100 con" placeholder="请输入${data.customKey3}" id="enroll-customKey3" name="customKey3" />
                			</div>
                		</div>`;
			}
			if(data.customKey4){
				rules = {
					...rules,
					customKey4: {
            			required: true
					}
				}
				
				html1 +=`<div class="form-item b_e_b">
			                <div class="am-flexbox">
			                    <span class="item-title">${data.customKey4}</span>
			                    <input type="text" placeholder="请输入${data.customKey4}" id="customKey4" name="customKey4" class="input-item">
			                </div>
			            </div>`;
			    html2 += `<div class="wrap">
                			<samp class="fl tit">${data.customKey4}：</samp>
                			<div class="fr conWrap">
                				<input type="text" class="wp100 con" placeholder="请输入${data.customKey4}" id="enroll-customKey4" name="customKey4" />
                			</div>
                		</div>`;
			}
			if(data.customKey5){
				rules = {
					...rules,
					customKey5: {
            			required: true
					}
				}
				
				html1 +=`<div class="form-item b_e_b">
			                <div class="am-flexbox">
			                    <span class="item-title">${data.customKey5}</span>
			                    <input type="text" placeholder="请输入${data.customKey5}" id="customKey5" name="customKey5" class="input-item">
			                </div>
			            </div>`;
			    html2 += `<div class="wrap">
                			<samp class="fl tit">${data.customKey5}：</samp>
                			<div class="fr conWrap">
                				<input type="text" class="wp100 con" placeholder="请输入${data.customKey5}" id="enroll-customKey5" name="customKey5" />
                			</div>
                		</div>`;
			}
			
			$(".userForm-wrap").append(html1);
			$("#enrollForm").append(html2);
			
	        _formWrapper.validate({
	            'rules': {
	            	...rules,
	            	iceName:{},
	            	iceMobile:{
	            		mobile: true
	            	},
	            	applyNote:{}
	            },
	            onkeyup: false
	        });
			
			_enrollForm.validate({
	            'rules': rules,
	            onkeyup: false
	        })
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
					<div class="deleteWrap fl"><div class="delete chooseList-delete"></div></div>
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
					<div class="deleteWrap fl"><div class="delete chooseList-delete"></div></div>
				</div>`
	}
	
	//获取金额
	function getAmount(){
		var amount = 0; //总金额
		var actAmount = $("#activityWrap #price").attr('data-prict');//活动金额
		
		//直接报名
		if(type==1){
			amount = base.formatMoney(actAmount*peopleNum*1000);
			
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
	//获取金额
	function getYunfei(params){
		base.showLoading()
		return ActivityStr.getYunfei(params).then((data)=>{
			var actAmount = $("#activityWrap #price").attr('data-prict');//活动金额
			$("#totalAmount").html('￥'+base.formatMoney(data.totalAmount+(actAmount*(peopleNum-1)*1000)))
			base.hideLoading()
		}, base.hideLoading)
	}
	
	//提交订单
	function submitOrder(params){
		console.log(params);
		return ActivityStr.placeOrder(params).then((data)=>{
			
			//免费
			if(amountType==0 && type!=2){
				base.showMsg("报名成功！")
				setTimeout(() => {
					if(isWxGroupQrcode=='1'){
                		base.gohrefReplace("../activity/doSuccess.html?code="+code);
					} else {
                		base.gohrefReplace("../user/activity-orders.html");
					}
                }, 500);
			//收费
			}else if(amountType== 0 && type==2 && params.prodList.length==0&&params.rprodList.length==0){
				base.showMsg("报名成功！")
				setTimeout(() => {
					if(isWxGroupQrcode=='1'){
                		base.gohrefReplace("../activity/doSuccess.html?code="+code);
					} else {
                		base.gohrefReplace("../user/activity-orders.html");
					}
                }, 500);
			//有选择装备
			}else{
				base.showMsg("提交成功！")
				setTimeout(() => {
					location.href = '../pay/pay.html?code='+data.code+'&type=activity&isWxGroupQrcode='+isWxGroupQrcode;
                }, 500);
			}
			
			base.hideLoading()
		}, base.hideLoading)
	}
	
	// 下单
	function goSubmitOrder(){
		var params = {};
		//收费活动需填写真实信息
		if(amountType=='1'){
			var enrollList = [];
			var formData = $('#formWrapper').serializeObject();
			config.iceName = formData.iceName;
			config.iceMobile = formData.iceMobile;
			delete formData.iceName;
			delete formData.iceMobile;
			
			enrollList.push(formData);
			enrollList = enrollList.concat(enrollListTmpl);
			
			config.enrollList = enrollList;
		}
		
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
			config.toUser = $("#toUser").attr("data-touser");
			
			if(config.prodList.length&&config.toUser==SYS_USER&&!config.receiver){
				base.showMsg("请选择地址")
			}else if(config.rprodList.length&&!config.receiver&&config.toUser==SYS_USER){
				base.showMsg("请选择地址")
			}else{
				submitOrder(config);
			}
		};
			
	}
	
	// 同行好友 弹窗-关闭
	function enrollDialogClose(){
		$("#enrollDialog").addClass('hidden');	
    	$("#enrollForm").get(0).reset();
	}
	
	//添加同行好友
	function addEnroll(params){
		base.showLoading();
		var html = '';
		var gender1 = '',gender2 = '';
		
		if(params.gender == '1'){
			gender1 = 'selected'
		} else {
			gender2 = 'selected'
		}
		
		html = `<div class="enrollList-item ${enrollListTmpl.length >=1 ? 'mt20' : ''} enrollList-item-${enrollListTmpl.length}" data-index="${enrollListTmpl.length}">
					<div class="form-item b_e_b">
		                <div class="am-flexbox">
		                    <span class="item-title">户外昵称</span>
		                    <input type="text" placeholder="请输入户外昵称" value="${params.outName}" class="input-item">
		                </div>
		                <div class="inputMask"></div>
		            </div>
		            <div class="form-item b_e_b">
		                <div class="am-flexbox">
		                    <span class="item-title">联系电话</span>
		                    <input type="tel" placeholder="请输入联系电话" pattern="[0-9]*" value="${params.mobile}" class="input-item">
		                </div>
		                <div class="inputMask"></div>
		            </div>
		            <div class="form-item b_e_b">
		                <div class="am-flexbox">
		                    <span class="item-title">真实姓名</span>
		                    <input type="text" placeholder="请输入真实姓名" value="${params.realName}" class="input-item">
		                </div>
		                <div class="inputMask"></div>
		            </div>
		            <div class="form-item b_e_b">
		                <div class="am-flexbox">
		                    <span class="item-title">身份证号</span>
		                    <input type="text" placeholder="请输入身份证号" value="${params.idNo}" class="input-item">
		                </div>
		                <div class="inputMask hidden"></div>
		            </div>
		            <div class="form-item b_e_b">
		                <div class="am-flexbox">
		                    <span class="item-title">性别</span>
		                    <select class="select-item" value="${params.gender}">
		                    	<option value="1" ${gender1}>男</option>
		                    	<option value="2" ${gender2}>女</option>
		                    </select>
		                </div>
		                <div class="inputMask"></div>
		            </div>`;
		if(params.customKey1){
			html += `<div class="form-item b_e_b">
	                <div class="am-flexbox">
	                    <span class="item-title">${params.customKey1}</span>
	                    <input type="text" placeholder="请输入名称1" value="${params.customKey1}" class="input-item">
	                </div>
	            </div>`;
		}
		if(params.customKey2){
			html += `<div class="form-item b_e_b">
	                <div class="am-flexbox">
	                    <span class="item-title">${params.customKey2}</span>
	                    <input type="text" placeholder="请输入名称2" value="${params.customKey2}" class="input-item">
	                </div>
	            </div>`;
		}
		if(params.customKey3){
			html += `<div class="form-item b_e_b">
	                <div class="am-flexbox">
	                    <span class="item-title">${params.customKey3}</span>
	                    <input type="text" placeholder="请输入名称3" value="${params.customKey3}" class="input-item">
	                </div>
	            </div>`;
		}
		if(params.customKey4){
			html += `<div class="form-item b_e_b">
	                <div class="am-flexbox">
	                    <span class="item-title">${params.customKey4}</span>
	                    <input type="text" placeholder="请输入名称4" value="${params.customKey4}" class="input-item">
	                </div>
	            </div>`;
		}
		if(params.customKey5){
			html += `<div class="form-item b_e_b">
	                <div class="am-flexbox">
	                    <span class="item-title">${params.customKey5}</span>
	                    <input type="text" placeholder="请输入名称5" value="${params.customKey5}" class="input-item">
	                </div>
	            </div>`;
		}
		html += `<div class="form-item b_e_b over-hide">
		    		<div class="am-button am-button-red am-button-small fr delete-btn" data-index="${enrollListTmpl.length}">删除</div>
	            </div>
			</div>`;
		
		enrollListTmpl.push(params);
		$(".enrollList-wrap").append(html);
		peopleNum ++;
		getAmount();
		enrollDialogClose();
		
		base.hideLoading();
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
            			
						base.hideLoading()
            		//自提
            		}else{
						var html = `<div class="icon icon-dz"></div>
						<div class="wp100 over-hide"><samp class="fl addressee">提货点：${res.toUserName}</samp></div>
						<div class="detailAddress">提货点地址： ${res.toUserAddress}</div>`
						
            			$("#toUser").find('.toUserName').children('samp').html("自提")
            			
						$("#orderAddressWrap").removeClass("hidden")
						$("#toStoreAddress").html(html).removeClass('hidden')
            			$('#orderAddress').addClass('hidden')
            			
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
        
		//提交
		$("#subBtn").click(function(){
			if(!isBindMobile){
				BindMobile.showMobileCont();
			}else{
				//收费活动
				if(amountType=='1'){
					if (_formWrapper.valid()) {
						if(isUserInfo){
							goSubmitOrder();
						}else{
							var msg = '<div class="actMsgWrap"><p>请确认身份信息，后期报名活动无法更改：</p>'
								+'<samp>户外昵称： '+$("#outName").val()+'</samp>'
								+'<samp>联系号码： '+$("#mobile").val()+'</samp>'
								+'<samp>真实姓名： '+$("#realName").val()+'</samp>'
								+'<samp>身份证号： '+$("#idNo").val()+'</samp>'
								+'<samp>性别： '+$("#gender option:selected").text()+'</samp>'
								+'</div>'
							
							base.confirm(msg).then(()=>{
								goSubmitOrder();
							},()=>{})
						}
					}
				}else{
					goSubmitOrder();
				}
				
			}
		})
		
		// 同行好友
		
		var touchFalg=false;
		
        //同行好友 弹窗-取消
        $("#enrollDialog .canlce").click(function(){
        	touchFalg = false
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        	
            enrollDialogClose();
        })
        
        //同行好友 弹窗-确定
        $("#enrollDialog .confirm").click(function(){
        	var params = _enrollForm.serializeObject();
        	if(_enrollForm.valid()){
        		addEnroll(params);
        	}
        })
		
		// 添加按钮
		$("#addEnrollBtn").click(function(){
			$("#enrollDialog").removeClass('hidden');
		})
		
		// 同行好友列表 删除按钮 点击事件
		$(".enrollList-wrap").on('click', '.enrollList-item .delete-btn', function(){
			var index = $(this).attr("data-index");
			base.confirm("确定删除这个同行好友记录？").then(()=>{
				$(".enrollList-item-"+index).remove();
				delete enrollListTmpl[index];
				peopleNum --;
				getAmount();
				base.showMsg("操作成功");
			},()=>{})
		})
		
		
	}
})
