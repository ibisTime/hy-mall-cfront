define([
    'app/controller/base',
    'app/util/dict',
    'app/module/scroll',
    'app/module/qiniu',
    'app/interface/LeaseCtr',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr'
], function(base, Dict, scroll, qiniu, LeaseCtr, GeneralCtr, UserCtr) {
    var config = {
        start: 1,
        limit: 10
    }, isEnd = false, canScrolling = false;
    var orderStatus = Dict.get("leaseOrderStatus");
    var currentType = 0,
        type2Status = {
            "0": [],
            "1": ['1'],
            "2": ['2'],
            "3": ['3'],
            "4": ['4'],
            "5": ['5'],
            "6": ['6'],
            "7": ['8'],
            "8": ['7'],
        };
    var myScroll;

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
    	initScroll()
        base.showLoading();
        $.when(
        	getPageOrders(),
        	getBackLogisticsCompany(),
        	getReturnAddress(),
        	getBackStore(),
        	initUpload()
        )
        addListener();
    }
    
    //导航滑动
    function initScroll() {
        var width = 0;
        var _wrap = $("#am-tabs-bar");
        _wrap.find('.am-tabs-tab').each(function () {
            width += this.clientWidth;
        });
        _wrap.find('.scroll-content').css('width', width+ 2 + 'px');
        myScroll = scroll.getInstance().getScrollByParam({
            id: 'am-tabs-bar',
            param: {
                scrollX: true,
                scrollY: false,
                eventPassthrough: true,
                snap: true,
                hideScrollbar: true,
                hScrollbar: false,
                vScrollbar: false
            }
        });
    }
    
    // 分页查询订单
    function getPageOrders(refresh) {
                base.hideLoading();
        return LeaseCtr.getPageOrders({
            statusList: type2Status[currentType],
            ...config
        }, refresh)
            .then((data) => {
                base.hideLoading();
                hideLoading();
                var lists = data.list;
                var totalCount = +data.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                } else {
                    isEnd = false;
                }
                if(data.list.length) {
                    var html = "";
                    lists.forEach((item) => {
                        html += buildHtml(item);
                    });
                    $("#content")[refresh || config.start == 1 ? "html" : "append"](html);
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
                } else if(config.start == 1) {
                    $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无订单</p></div>');
                    $("#loadAll").addClass("hidden");
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                !isEnd && $("#loadAll").addClass("hidden");
                canScrolling = true;
            }, () => hideLoading());
    }
    //订单列表
    function buildHtml(item) {
    	var tmplProHtml = '',tmplbtnHtml =' ';
    	
		tmplProHtml+=`<a class="mall-item leaseOrder-item" href="./lease-orderDetail.html?code=${item.code}">
		<div class="mall-item-img fl" style="background-image: url('${base.getImg(item.rproduct.advPic)}')"></div>
		<div class="mall-item-con fr">
			<p class="name">${item.rproduct.name}</p>
				<samp class="slogan">数量：${item.quantity}</samp>
				<samp class="slogan">租赁时长：${item.rentDay}天</samp>
				<samp class="slogan">日租金：${item.price2 ? base.formatMoney(item.price2)+'积分' : '￥'+base.formatMoney(item.price1)}/天</samp>
				<div class="orderList-price">
    				<p>${orderStatus[item.status]}</p>
    			</div>
			</div></a>`
    	
    	//待支付
    	if(item.status == "1"){
    		tmplbtnHtml += `<div class="order-item-footer"><a class="am-button am-button-small am-button-red" href="../pay/pay.html?code=${item.code}&type=lease">立即支付</a>
                            <button class="am-button am-button-small cancel-order" data-code="${item.code}">取消预约</button></div>`
    	
    	// 已支付，待发货
    	}else if(item.status == "2"){
    		tmplbtnHtml += `<div class="order-item-footer"><button class="am-button am-button-small am-button-red " data-code="${item.code}">待发货</button></div>`
    	
    	//已发货
    	}else if(item.status == "3"){
    		tmplbtnHtml += `<div class="order-item-footer"><button class="am-button am-button-small am-button-red confirm-order" data-code="${item.code}">确认收货</button></div>`
    	
    	// 已收货， 体验中和逾期中
    	}else if(item.status == "4" || item.status == "6"){
    		var takePerson = item.takeType==1?item.storeUser.realName+' '+item.storeUser.mobile:''
    		tmplbtnHtml += `<div class="order-item-footer"><button class="am-button am-button-small am-button-red return-order" data-code="${item.code}" data-takeType="${item.takeType}"
    						data-storeUser="${item.storeUser?item.storeUser.userId:''}"  data-takePerson="${takePerson}" data-takeAddress="${takePerson+item.takeAddress}">待归还</button></div>`
    	
    	// 已收货
    	}else if(item.status == "7"){
    		tmplbtnHtml += `<div class="order-item-footer"><a class="am-button am-button-small am-button-red" href="./order-comment.html?type=lease&code=${item.code}">待评价</button></a>`
    	
    	//91：用户异常 
    	}else if(item.status == "91"){
    		tmplbtnHtml += `<div class="order-item-footer"><button class="am-button am-button-small am-button-red delete-order" data-code="${item.code}">删除订单</button></div>`;
    	}
    	
        return `<div class="order-item leaseOrder-item">
                    <div class="order-item-header">
                        <span>订单编号:${item.code}</span>
                        <span class="fr">${base.formatDate(item.applyDatetime, "yyyy-MM-dd")}</span>
                    </div>
                    <div class="orderPro-list">`+tmplProHtml+`</div><div class="totalAmout"><p>总价:<samp>
                    ${item.amount1&&item.amount2
                    	? '￥'+base.formatMoney(item.amount1+item.yunfei)+' + '+base.formatMoney(item.amount2)+'积分'
                    	:item.amount1?'￥'+base.formatMoney(item.amount1+item.yunfei):item.yunfei
                    	?'￥'+base.formatMoney(item.yunfei)+' + '+base.formatMoney(item.amount2)+'积分':base.formatMoney(item.amount2)+'积分'}
                    </samp></p><p class="realDeposit">含押金: ${'￥'+base.formatMoney(item.realDeposit)} ${item.yunfei?' 运费:￥'+base.formatMoney(item.yunfei)+'':''} </p>
                    </div>`+tmplbtnHtml+`</div></div>`;

    }
    
    //获取自提点
    function getBackStore(){
    	return UserCtr.getPagePartner(true).then((data)=>{
    		var html = '';
    		
    		data.list.forEach(function(d, i){
    			html+=`<option value="${d.userId}"  data-address="${d.province+' '+d.city+' '+d.area+' '+d.address}">${d.realName}</option>`
    		})
    		
    		$('#backStore').html(html)
    	})
    }
    
	//归还邮寄地址
	function getReturnAddress(){
		$.when(
			GeneralCtr.getDictList({key:'back_info_person'},'808917'),
			GeneralCtr.getDictList({key:'back_info_address'},'808917'),
		).then((data,data2)=>{
			$("#dialog-returnAddress2 .textarea").html(data.cvalue+' '+data2.cvalue);
			$("#dialog-returnAddress2").attr('data-backAddress',data.cvalue+' '+data2.cvalue);
    	},()=>{})
	}
	
    //获取物流公司列表
    function getBackLogisticsCompany(){
    	GeneralCtr.getDictList({parentKey:'back_kd_company'},'801907').then((data)=>{
    		var html = ''
    		data.forEach(function(d, i){
    			html += `<option value='${d.dkey}'>${d.dvalue}</option>`;
    		})
    		
    		$("#backLogisticsCompany").append(html)
    	},()=>{})
    }
    
    //归还租赁
    function returnOrder(param){
//  	console.log(param)
        base.confirm('确认归还吗？').then(() => {
	    	base.showLoading("提交中...");
	        LeaseCtr.returnOrder(param)
	            .then(() => {
	            	base.hideLoading();
	                base.showMsg("操作成功");
	                setTimeout(function(){
	                	location.reload(true)
	                },800)
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
    	$(".addbackPdf").removeClass('hidden')
		$("#backPdf").html("");
		$('#backPdf').attr('data-key','')
		$('#backStore option').eq(0).attr('selected','selected')
		$("#backStoreAddress .textarea").html($('#backStore option').eq(0).attr('data-address'))
		
		$("#dialog-returnAddress2").addClass('hidden')
		$("#returnAddressType").addClass('hidden')
		$('#returnAddressType select').val('2')
		
        $(".backLogisticsCompany").removeClass('hidden')
		$(".backLogisticsCode").removeClass('hidden')
		$(".backAddress").addClass('hidden')
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

    function addListener(){
        // tabs切换事件
        var _tabsInkBar = $("#am-tabs-bar").find(".am-tabs-ink-bar"),
            _tabpanes = $("#am-tabs-content").find(".am-tabs-tabpane");
        $("#am-tabs-bar").on("click", ".am-tabs-tab", function(){
            var _this = $(this), index = _this.index() - 1;
            if(!_this.hasClass("am-tabs-tab-active")){
                _this.addClass("am-tabs-tab-active")
                    .siblings(".am-tabs-tab-active").removeClass("am-tabs-tab-active");
                _tabsInkBar.css({
                    "-webkit-transform": "translate3d(" + index * 1.5 + "rem, 0px, 0px)",
                    "-moz-transform": "translate3d(" + index * 1.5 + "rem, 0px, 0px)",
                    "transform": "translate3d(" + index * 1.5 + "rem, 0px, 0px)"
                });
                _tabpanes.eq(index).removeClass("am-tabs-tabpane-inactive")
                    .siblings().addClass("am-tabs-tabpane-inactive");
                    
                myScroll.myScroll.scrollToElement(_this[0], 200, true);
                // 当前选择查看的订单tab的index
                currentType = index;
                config.start = 1;
                base.showLoading();
                getPageOrders();
            }
        });
        
        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                var choseIndex = $(".am-tabs-tab-active").index() - 1;
                showLoading();
                getPageOrders();
            }
        });
        
        //取消订单
        $("#orderWrapper").on("click", ".cancel-order", function() {
            var orderCode = $(this).attr("data-code");
            base.confirm("确定取消该预约吗？", "取消", "确认")
                .then(() => {
                    base.showLoading("取消中...");
                    LeaseCtr.cancelOrder(orderCode)
                        .then(() => {
                            base.showMsg("取消成功");
                            base.showLoading();
                            config.start = 1;
                            getPageOrders(true);
                        });
                }, () => {});
        });
        
        //确认收货
        $("#orderWrapper").on("click", ".confirm-order", function() {
            var orderCode = $(this).attr("data-code");
            base.confirm('确认收货吗？')
                .then(() => {
                    base.showLoading("提交中...");
                    LeaseCtr.confirmOrder(orderCode)
                        .then(() => {
                            base.showMsg("操作成功");
                            base.showLoading();
                            config.start = 1;
                            getPageOrders(true);
                        });
                }, () => {});
        });
        
        //删除订单
        $("#orderWrapper").on("click", ".delete-order", function() {
            var orderCode = $(this).attr("data-code");
            base.confirm('确认删除订单吗？')
                .then(() => {
                    base.showLoading("删除中...");
                    LeaseCtr.deleteOrder(orderCode)
                        .then(() => {
                            base.showMsg("操作成功");
                            base.showLoading();
                            config.start = 1;
                            getPageOrders(true);
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
        		$("#returnAddressType").removeClass('hidden')
        		$(".backAddress").addClass('hidden')
        		//自提
        		if($("#dialog #confirm").attr('data-deductType')==1){
        			
        			$('#returnAddressType select').val('2')
        			$("#dialog-returnAddress1").removeClass('hidden')
        		//邮递
        		}else{
        			
        			$("#dialog-returnAddress1").addClass('hidden')
        			$("#dialog-returnAddress2").removeClass('hidden')
        			$('#returnAddressType select').val('1')
        		}
        	}
        })
        
        //寄还地址选择
		var touchFalg=false;
        $("#returnAddressType select").on('change',function(){
        	//平台
        	if($(this).val()== 1){
            	$("#dialog #confirm").attr('data-backAddress', $("#dialog-returnAddress2").attr('data-backAddress'))
        		$("#dialog-returnAddress1").addClass('hidden')
        		$("#dialog-returnAddress2").removeClass('hidden')
        	//自提点
        	}else{
        		
            	$("#dialog #confirm").attr('data-backAddress', $("#dialog-returnAddress3").attr('data-backAddress'))
        		$("#dialog-returnAddress1").removeClass('hidden')
        		$("#dialog-returnAddress2").addClass('hidden')
        	}
        })
        
        //归还按钮
        $("#orderWrapper").on("click", ".return-order", function() {
            var orderCode = $(this).attr("data-code");
            var takeType = $(this).attr("data-takeType");
            var takeAddress = $(this).attr("data-takeAddress");
            var takePerson = $(this).attr("data-takePerson");
            var storeUser = $(this).attr("data-storeUser");
            
            $("#dialog #confirm").attr('data-code', orderCode)
            $("#dialog #confirm").attr('data-deductType', takeType)
            $("#dialog #confirm").attr('data-backAddress', takeAddress)
    		$("#dialog-returnAddress1 .textarea").html(takePerson+' '+takeAddress)
    		$("#dialog-returnAddress1").attr('data-backAddress',takeAddress)
    		
            //takeType 1:自提 , 2: 邮寄
        	var htmlCackType = '';
			var htmlReturnAddressType = '';
        	
            if(takeType == '1'){
            	htmlCackType = '<option value="1" selected>上门归还</option><option value="2">邮寄</option>';
				htmlReturnAddressType = '<option value="2">自提点</option><option value="1">平台</option>';
				
        		$(".backLogisticsCompany").addClass('hidden')
        		$(".backLogisticsCode").addClass('hidden')
        		$("#dialog-returnAddress1").addClass('hidden')
        		$("#returnAddressType").addClass('hidden')
        		$(".backAddress").removeClass('hidden')
        		
        		$('#backStore option').each(function(i, d){
        			if(d.value == storeUser){
        				$('#backStore option').eq(i).attr('selected','selected')
						$("#backStoreAddress .textarea").html($('#backStore option').eq(i).attr('data-address'))
        				return false;
        			}
        		})
        		
            }else{
            	htmlCackType = '<option value="1">上门归还</option><option value="2" selected>邮寄</option>';
				htmlReturnAddressType = '<option value="1">平台</option>';
				
            	$(".backLogisticsCompany").removeClass('hidden')
        		$(".backLogisticsCode").removeClass('hidden')
        		$("#dialog-returnAddress2").addClass('hidden')
        		$("#dialog-returnAddress2").removeClass('hidden')
        		$("#returnAddressType").removeClass('hidden')
        		$(".backAddress").addClass('hidden')
        		
        		
				$("#backStoreAddress .textarea").html($('#backStore option').eq(0).attr('data-address'))
            }
            
            $("#backType").html(htmlCackType);
        	$("#returnAddressType select").html(htmlReturnAddressType);
            
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
        
        //上门归还-自提点
        $("#backStore").on('change',function(){
    		$("#backStoreAddress .textarea").html($('#backStore option:selected').attr('data-address'))
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
	        		
        			if($("#dialog #confirm").attr('data-deductType')==2){
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
    
    function showLoading() {
        $("#loadingWrap").removeClass("hidden");
    }

    function hideLoading() {
        $("#loadingWrap").addClass("hidden");
    }
});
