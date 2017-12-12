define([
    'app/controller/base',
    'app/module/AddressList',
    'app/interface/UserCtr',
    'app/module/bindMobile',
    'app/module/ActivityChooseMallList',
    'app/module/ActivityChooseLeaseList',
], function(base, AddressList, UserCtr, BindMobile, ActivityChooseMallList, ActivityChooseLeaseList) {
	var code = base.getUrlParam("code");
	
	var config = {
		actCode: code,
    	receiver: "",
        reMobile: "",
        reAddress: "",
        prodList:[],
        rprodList:[]
	};
    init();

	function init(){
		
		addListener()
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
            	
            }
        });
		AddressList.showCont({
			code: c
		});
	}
	
	//商品列表
	function mallBuildHtml(item){
		
		return `<div class="mall-item chooseList-wrap" data-code="${item.code}" data-speccode="${item.speccode}"  data-quantity="${item.quantity}" >
					<div class="mall-item-img fl" style="background-image: url('${base.getImg(item.advPic)}');"></div>
					<div class="mall-item-con fl">
						<p class="name">${item.name}</p>
						<samp class="slogan">${item.productSpecs}</samp>
						<div class="price">
							<samp class="samp1">${item.price}</samp>
							<samp class="samp2">${item.quantity}</samp>
						</div>
					</div>
					<div class="deleteWrap fl"><div class="delete chooseList-delete"><div></div>
				</div>`
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
        
        //选择商品面板
		ActivityChooseMallList.addCont({
        	success: function(proList) {
        		if(proList.length){
        			var html = ""
        			proList.forEach(function(item){
        				
        				html+= mallBuildHtml(item)
        			})
        			$("#actChoose-mall").html(html);
        		}
        	}
        });
        
        //选择租赁面板
		ActivityChooseLeaseList.addCont({
        	success: function() {
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
        
        //报名活动 点击
		$("#submitBtn").click(function(){
			location.href="../activity/submitOrder.html?type=2&code="+code
		})
        
        //删除
        $("body").on("click",".chooseList-delete",function(){
        	var _this = $(this)
        	base.confirm("确定删除？").then(()=>{
        		_this.parents(".chooseList-wrap").remove();
        	},()=>{})
        })
        
        $("#submitBtn").click(function(){
			
			
        })
	}
})
