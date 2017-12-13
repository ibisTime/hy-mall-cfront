define([
    'jquery',
    'app/controller/base',
    'app/interface/GeneralCtr',
    'app/interface/LeaseCtr',
    'app/module/leaseDate',
    'app/module/scroll',
], function ($, base, GeneralCtr, LeaseCtr, leaseDate, scroll) {
    var tmpl = __inline("index.html");
    var defaultOpt = {};
    var firstAdd = true;
    var leaseData = {};
    
	var totalAmount = {
		price1:0,//人民币总价
		price2:0,//积分总价
		deposit:0, //押金
		yunfei:0 // 运费
	};
    var minRentDays = 1,
    	type,
    	myScroll;

    function initData(){
        base.showLoading();
        $.when(
        	getLeaseProductDetail(),
        	getLeaseRules()
        )
    }
    
    function addListener(){
        //包装清单弹窗-显示
		var touchFalg=false;
        $("#LeaseSubmitContainer .orderPro-list").on('click','#packingList',function(){
        	$("#dialog").removeClass('hidden');
        	touchFalg = true
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        })
        
        //包装清单弹窗-关闭
        $("#LeaseSubmitContainer #dialog").on("click",".close",function(){
        	$("#dialog").addClass('hidden')
        	touchFalg = false;
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        })
        
       //购买数量 减
        $("#LeaseSubmitContainer .productSpecs-number .subt").on("click",function(){
			var sum = +$('#LeaseSubmitContainer .productSpecs-number .sum').html()
			if(sum>1){
				sum--
			}
			$('#LeaseSubmitContainer .productSpecs-number .sum').html(sum);
			getAmount();
		})
		
		//购买数量 加
        $("#LeaseSubmitContainer .productSpecs-number .add").on("click",function(){
			var sum = +$('#LeaseSubmitContainer .productSpecs-number .sum').html()
			if(sum<$('#LeaseSubmitContainer .productSpecs-number .sum').attr('data-quantity')){//库存
				sum++
			}
			$('#LeaseSubmitContainer .productSpecs-number .sum').html(sum);
			getAmount();
		})
		
        //包装清单弹窗-关闭
        $("#leaseRuleDialog .close").on("click",function(){
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
		$("#leaseRuleBtn").on("click",function(){
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
        $("#leaseRuleDialog .close").on("click",function(){
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
    
    //获取详情
	function getLeaseProductDetail(){
		LeaseCtr.getLeaseProductDetail(defaultOpt.code).then((data)=>{
			
			minRentDays = data.minRentDays;
			type = data.type;
			var html = '';
			var packsListHtml ='';
			
			data.packsList.forEach(function(d, i){
				packsListHtml += `<div class="packingList"><i class="dot fl"></i><p class="name fl">${d.name}</p><samp class="quantity fr" id='quantity'>*${d.quantity}</samp></div>`
			})
			
			html = `<div class="lease-submit-item"><div class="mall-item">
			    		<div class="mall-item-img fl" style="background-image: url('${base.getImg(data.advPic)}');" ></div>
			    		<div class="mall-item-con fr">
			    			<p class="name">${data.name}</p>
			    			<samp class="slogan tcolor_red">最少租赁时长：<i>${data.minRentDays}</i>天</samp>
			    		</div></div>
    					<div class="packingList-btn" id="packingList">查看包装清单</div>
    				</div>`;
    		
			$("#LeaseSubmitContainer .orderPro-list").html(html);
			$('#dialog .packingList-wrap div').html(packsListHtml);
			
			$("#rent").html(type==JFLEASEPRODUCTTYPE ? base.formatMoney(data.price2)+'积分 /天' : '￥'+base.formatMoney(data.price1)+' /天')
			$("#rentDay").html(data.minRentDays)
			$("#deposit").html('￥'+base.formatMoney(data.deposit))
			$("#dayOverdueFee").html('￥'+base.formatMoney(data.dayOverdueFee))
			$('#weight').html(data.weight+'kg')
			$('#LeaseSubmitContainer .productSpecs-number .sum').attr("data-quantity",data.quantity)
			
			totalAmount.deposit = data.deposit;
			totalAmount.price1=data.price1;
			totalAmount.price2=data.price2;
			
			//获取减免金额
//			getLeaseProJmAmount(1);
			
			getAmount();
			
			base.hideLoading()
			setLeaseDate();
		},base.hideLoading)
	}
	
	//获取金额
	function getAmount(){
		var days = $("#rentDay").html();
		
		var amount = totalAmount.price1*$('#LeaseSubmitContainer .productSpecs-number .sum').html()*days+totalAmount.deposit*$('#LeaseSubmitContainer .productSpecs-number .sum').html()
		var deposit = totalAmount.deposit*$('#LeaseSubmitContainer .productSpecs-number .sum').html()
		
		$("#deposit").html('￥'+base.formatMoney(deposit)).attr("data-deposit",deposit)
		$("#LeaseSubmitContainer").find(".totalAmount").html('￥'+base.formatMoney(amount)).attr("data-totalAmount",amount)
		
	}
	
	//获取租赁规则说明
	function getLeaseRules(){
		return GeneralCtr.getUserSysConfig('rent_rule',true).then((data)=>{
			$("#leaseRuleDialog-content div").html(data.cvalue)
		})
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
					
					//获取减免金额
//	    			getLeaseProJmAmount(1);
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
    
    function doError(cc) {
        $(cc).html('<div style="text-align: center;line-height: 3;">暂无数据</div>');
    }

    var ModuleObj = {
        addCont: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasCont()){
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var wrap = $("#LeaseSubmitContainer");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").text(defaultOpt.title);
            var that = this;
            if(firstAdd){
            	
        		addListener();
        		
                wrap.on("click", ".right-left-cont-back", function(){
                	leaseData={}
                    ModuleObj.hideCont(defaultOpt.success);
                });
                
                wrap.on("click", ".right-left-btn .subBtn", function(){
                	leaseData={}
            	
	            	leaseData.totalAmount = $("#LeaseSubmitContainer").find(".totalAmount").attr("data-totalAmount")
	            	leaseData.startDate = $("#startDate").html()
	            	leaseData.endDate = $("#endDate").html()
	            	leaseData.quantity = $('#LeaseSubmitContainer .productSpecs-number .sum').html();
	            	leaseData.rentDay = $("#rentDay").html()
	            	leaseData.deposit = $("#deposit").attr("data-deposit")
	            	
                    ModuleObj.hideCont(defaultOpt.success);
                });
                
            }

            firstAdd = false;
            return this;
        },
        hasCont: function(){
            return !!$("#LeaseSubmitContainer").length;
        },
        showCont: function (option = {}){
            if(this.hasCont()){
            	if(option.code) {
                    defaultOpt.code = option.code;
                } else {
                    defaultOpt.code = "";
                }
                initData();
                ModuleObj._showCont();
            }
            return this;
        },
        _showCont: function(){
            var wrap = $("#LeaseSubmitContainer");
            wrap.show().animate({
                left: 0
            }, 200, function(){
                defaultOpt.showFun && defaultOpt.showFun();
            });
            
            var topWrap = wrap.find(".right-left-cont-title");
            topWrap.show().animate({
                left: 0
            }, 200, function () {
            });
            
            var btnWrap = wrap.find(".right-left-btn");
            btnWrap.show().animate({
                left: 0
            }, 200, function () {
            });
            
        },
        hideCont: function (func){
            if(this.hasCont()){
            	
                var wrap = $("#LeaseSubmitContainer");
                
            	var topWrap = wrap.find(".right-left-cont-title");
                topWrap.animate({
                    left: "100%"
                }, 200, function () {
                    btnWrap.hide();
                });
            	
                var btnWrap = wrap.find(".right-left-btn");
                btnWrap.animate({
                    left: "100%"
                }, 200, function () {
                    btnWrap.hide();
                });
                
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func(leaseData);
                    wrap.find("label.error").remove();
                });
                
            }
            return this;
        }
    }
    return ModuleObj;
});
