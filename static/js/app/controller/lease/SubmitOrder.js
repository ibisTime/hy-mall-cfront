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
		price1:0,//人民币总价
		price2:0,//积分总价
		deposit:0 //押金
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
	}
    var minRentDays = 1,type;
     
    
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
			
			minRentDays = data.minRentDays;
			type = data.type;
			var html = '';
			var packsListHtml ='';
			
			data.packsList.forEach(function(d, i){
				packsListHtml += `<div class="packingList"><i class="dot fl"></i><p class="name fl">${d.name}</p><samp class="quantity fr" id='quantity'>*${d.quantity}</samp></div>`
			})
			
			html = `<div class="lease-submit-item"><a class="mall-item" href="../lease/lease-detail.html?code=${data.code}">
    		<div class="mall-item-img fl" style="background-image: url('${base.getImg(data.advPic)}');"></div>
    		<div class="mall-item-con fr">
    			<p class="name">${data.name}</p>
    			<samp class="slogan">最少租赁时长：<i>${data.minRentDays}</i>天</samp></div></a><div class="packingList-btn" id="packingList">查看包装清单</div></div>`;
    		
			$(".orderPro-list").html(html);
			$('#dialog .packingList-wrap').html(packsListHtml);
			
			$("#rent").html(type==JFLEASEPRODUCTTYPE ? base.formatMoney(data.price2)+'积分' : '￥'+base.formatMoney(data.price1)+' /天')
			$("#rentDay").html(data.minRentDays)
			$("#deposit").html('￥'+base.formatMoney(data.deposit))
			$("#overdueRate").html(data.overdueRate)
			
			totalAmount.deposit = data.deposit;
			if(type==JFLEASEPRODUCTTYPE){
    			totalAmount.price2=data.price2;
    			
    			getAmount();
    		}else{
    			totalAmount.price1=data.price1;
    			
    			getLeaseProJmAmount(totalAmount.price1,1);
    		}
    		
			
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
			minDate:'5',
            callback :function(){//回调函数
            	var start=$("#startDate").html();
				var end=$("#endDate").html();
				start=start.replace(/-/g,"/");
				var startdate=new Date(start);
				end=end.replace(/-/g,"/");
				var enddate=new Date(end);
			
				var time=enddate.getTime()-startdate.getTime();
				var days=parseInt(time/(1000 * 60 * 60 * 24));
				$("#rentDay").html(days)
				
				if(type==JFLEASEPRODUCTTYPE){
	    			getAmount();
	    		}else{
	    			getLeaseProJmAmount(totalAmount.price1,1);
	    		}
            }  , 
            comfireBtn:'.comfire'//确定按钮的class或者id
        });
		
		var b=new Date();
        //b.setDate(a.getDate()+1)
        var ye=b.getFullYear();
        var mo=b.getMonth()+1;
        var da=b.getDate();
        $('#startDate').html(ye+'-'+mo+'-'+da);
          
        b=new Date(b.getTime()+24*3600*1000*minRentDays);
        var ye=b.getFullYear();
        var mo=b.getMonth()+1;
        var da=b.getDate();
        $('#endDate').html(ye+'-'+mo+'-'+da);
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
				config.receiver = data[0].addressee;
			    config.reMobile = data[0].mobile;
			    config.reAddress = data[0].province+' '+data[0].city+' '+data[0].district+' '+data[0].detailAddress;
			}else{
				$('.no-address').removeClass('hidden')
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
	function getLeaseProJmAmount(productPrice,quantity){
		
		LeaseCtr.getLeaseProJmAmount({
			productPrice:productPrice,
			quantity:quantity
		}).then((data)=>{
			$("#jmAmount").html('￥'+base.formatMoney(data.jmyjAmount)).attr('data-jmAmount',data.jmyjAmount);
			
			getAmount();
		},()=>{})
	}
	
	//获取金额
	function getAmount(){
		var days = $("#rentDay").html();
		
		var amount = type==JFLEASEPRODUCTTYPE 
				? base.formatMoney(totalAmount.price2*$('.productSpecs-number .sum').html()*days)+'积分 + ￥' + base.formatMoney(totalAmount.deposit*$('.productSpecs-number .sum').html())
				: '￥'+base.formatMoney(totalAmount.price1*$('.productSpecs-number .sum').html()*days+totalAmount.deposit*$('.productSpecs-number .sum').html()-$("#jmAmount").attr('data-jmAmount'))
		
		var amount1 = type==JFLEASEPRODUCTTYPE 
				? base.formatMoney(totalAmount.price2*$('.productSpecs-number .sum').html()*days)+'积分'
				: '￥'+base.formatMoney(totalAmount.price1*$('.productSpecs-number .sum').html()*days)
		
		$("#totalAmount").html(amount)
		$("#totalAmount2").html(amount)
		$("#totalAmount3").html('租金：'+ amount1 +' 押金：￥'+base.formatMoney(totalAmount.deposit*$('.productSpecs-number .sum').html()-$("#jmAmount").attr('data-jmAmount')))
		
	}
	
	function addListener(){
        
		//地址
		$(".orderAddress").click(function(){
			AddressList.addCont({
	            userId: base.getUserId(),
	            success: function(res) {
	            	config.receiver = res.receiver;
				    config.reMobile = res.reMobile;
				    config.reAddress = res.reAddress;
				    config.takeStore = $("#toUser").attr('data-toUser')
				    
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
	            	
	            	config.receiver = res.receiver;
				    config.reMobile = res.reMobile;
				    config.reAddress = res.reAddress;
				    config.takeStore = $("#toUser").attr('data-toUser')
	            	$('.no-address').addClass('hidden')
	            }
	        });
	        
			AddressList.showCont({
				code: $(".orderAddress").attr('data-code')
			});
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
			
			if(config.rentDay<minRentDays){
				base.showMsg('租赁时间不能最少于最小租赁天数');
			}else if($("#toUser").attr('data-toUser')==SYS_USER && !config.receiver){
				base.showMsg('请选择地址');
			}else{
				submitOrder(config)
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
	            			config.receiver = '';
						    config.reMobile = '';
						    config.reAddress = '';
	            			$('.orderAddressWrap').removeClass('hidden')
	            		}else{
	            			$('.orderAddressWrap').addClass('hidden')
	            		}
	            	}
	            }
	        });
        
			ExpressList.showCont({});
		})
        
        //包装清单弹窗-显示
        $(".orderPro-list").on('click','#packingList',function(){
        	$("#dialog").removeClass('hidden')
        })
        
        //包装清单弹窗-关闭
        $("#dialog #close").click(function(){
        	$("#dialog").addClass('hidden')
        })
        
        
       //购买数量 减
		$('.productSpecs-number .subt').click(function(){
			var sum = +$('.productSpecs-number .sum').html()
			if(sum>1){
				sum--
			}
			$('.productSpecs-number .sum').html(sum);
			
			if(type==JFLEASEPRODUCTTYPE){
    			getAmount();
    		}else{
    			getLeaseProJmAmount(totalAmount.price1,$('.productSpecs-number .sum').html());
    		}
			
		})
		
		//购买数量 加
		$('.productSpecs-number .add').click(function(){
			var sum = +$('.productSpecs-number .sum').html()
//			if(sum<$(".quantity").attr('data-quantity')){
				sum++
//			}
			$('.productSpecs-number .sum').html(sum);
			getLeaseProJmAmount(totalAmount.price1,$('.productSpecs-number .sum').html());
		})
		
		
		
		
	}
	
})
