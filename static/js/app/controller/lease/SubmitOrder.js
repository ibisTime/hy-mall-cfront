define([
    'app/controller/base',
    'app/module/foot',
    'app/interface/LeaseCtr',
    'app/interface/UserCtr',
    'app/module/AddressList',
    'app/module/expressList',
], function(base, Foot, LeaseCtr, UserCtr, AddressList, ExpressList) {
	var code = base.getUrlParam("code")||'';
	var totalAmount = {
		amount1:0,//人民币总价
		amount2:0//积分总价
	};
	var config = {
		toUser:'',
		applyNote: $("#applyNote").val(),
		pojo:{
	    	receiver: "",
	        reMobile: "",
	        reAddress: "",
	        applyUser: base.getUserId(),
	        companyCode: SYSTEM_CODE,
	        systemCode: SYSTEM_CODE
		}
	}
	var cartCodeList =[];
    
    init();

	function init(){
        base.showLoading(code);
        
    	$.when(
        	getLeaseProductDetail(code),
        	isDefaultAddress()
        )
        
    	$("#toUser").attr('data-toUser',SYS_USER)
    	$("#toUser .toUserName samp").html(SYS_USERNAME)
        base.hideLoading();
        addListener()
	}
	
	//立即下单时获取详情
	function getLeaseProductDetail(c){
		LeaseCtr.getLeaseProductDetail(c).then((data)=>{
			
			var html = '';
			var type = data.type;
			
			html = `<div class="lease-submit-item"><a class="mall-item" href="../lease/lease-detail.html?code=${data.code}">
    		<div class="mall-item-img fl" style="background-image: url('${base.getImg(data.advPic)}');"></div>
    		<div class="mall-item-con fr">
    			<p class="name">${data.name}</p>
    			<samp class="slogan">租赁时长：${data.minRentDays}</samp></div></a><div class="packingList-btn" id="packingList">查看包装清单</div></div>`;
    			
			$(".orderPro-list").html(html);
		},()=>{})
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
				
				$(".orderAddress").html(html).attr('data-code',data[0].code)
				config.pojo ={
			    	receiver: data[0].addressee,
			        reMobile: data[0].mobile,
			        reAddress: data[0].province+' '+data[0].city+' '+data[0].district+' '+data[0].detailAddress,
			        applyUser: base.getUserId(),
			        companyCode: SYSTEM_CODE,
			        systemCode: SYSTEM_CODE
			    }
			}else{
				$('.no-address').removeClass('hidden')
			}
		},()=>{})
		
	}
	
	//提交订单-立即下单
	function submitOrder1(param){
		base.showLoading()
		LeaseCtr.placeOrder(param,true).then((data)=>{
			base.hideLoading();
			$("#mask").removeClass('hidden');
			base.showMsg('下单成功！',1200)
			
			setTimeout(function(){
				location.href = '../pay/pay.html?code='+data+'&type=mall';
			},800)
		},()=>{})
	}
	
	function addListener(){
        
		//地址
		$(".orderAddress").click(function(){
			AddressList.addCont({
	            userId: base.getUserId(),
	            success: function(res) {
	            	config.pojo = res;
	            	$('.no-address').addClass('hidden')
	            }
	        });
			AddressList.showCont({
				code: $(this).attr('data-code')
			});
		})
		
		//未添加地址
		$('.no-address').click(function(){
			
			AddressList.addCont({
	            userId: base.getUserId(),
	            success: function(res) {
	            	config.pojo = res;
	            	$('.no-address').addClass('hidden')
	            }
	        });
	        
			AddressList.showCont({
				code: $(".orderAddress").attr('data-code')
			});
		})
		
		//提交
		$("#subBtn").click(function(){
			
			config.toUser = $("#toUser").attr('data-toUser')
			var param={}
				
			if(config.pojo.receiver){
				param=config
			
				submitOrder1(param)
			}else if($("#toUser").attr('data-toUser')==SYS_USER){
				base.showMsg('请选择地址')
			}
				
		})
		
		//配送方式
		$("#toUser").click(function(){
			
			ExpressList.addCont({
	            success: function(to, toName) {
	            	if(to){
	            		$("#toUser").attr('data-toUser',to)
	            		$("#toUser").find('.toUserName').children('samp').html(toName)
	            		
	            		if(to==SYS_USER){
	            			$('.orderAddressWrap').removeClass('hidden')
	            		}else{
	            			$('.orderAddressWrap').addClass('hidden')
	            		}
	            	}
	            }
	        });
        
			ExpressList.showCont({});
		})
        
		$('#leaseDate').calendarSwitch({
            selectors : {
                sections : "#calendar"
            },
            index : 3,      //展示的月份个数
            animateFunction : "toggle",        //动画效果
            controlDay:false,//是否控制在daysnumber天之内，这个数值的设置前提是总显示天数大于60天
            daysnumber : "60",     //控制天数
            comeColor : "#66CCFF",       //起租颜色
            outColor : "#FF0033",      //寄回颜色
            comeoutColor : "#FFCCCC",        //起租和寄回之间的颜色
			title: '请选择租赁日期', //标题名称
			startName: '起租', //开始时间名称
			endName: '寄回', //开始时间名称
            callback :function(){
            }  ,   //回调函数
            comfireBtn:'.comfire'//确定按钮的class或者id
        });
		
		var b=new Date();
        //b.setDate(a.getDate()+1)
        var ye=b.getFullYear();
        var mo=b.getMonth()+1;
        var da=b.getDate();
        $('#startDate').html(ye+'-'+mo+'-'+da);
          
        b=new Date(b.getTime()+24*3600*1000);
        var ye=b.getFullYear();
        var mo=b.getMonth()+1;
        var da=b.getDate();
        $('#endDate').html(ye+'-'+mo+'-'+da);
	}
	
})
