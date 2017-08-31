define([
    'app/controller/base',
    'app/module/foot',
    'app/interface/MallCtr',
    'app/interface/UserCtr',
    'app/module/AddressList',
    'app/module/expressList'
], function(base, Foot, MallCtr, UserCtr, AddressList, ExpressList) {
	var code = base.getUrlParam("code")||'';
	var spec = base.getUrlParam("spec")||'';
	var quantity = base.getUrlParam("quantity")||'';
	var submitType = base.getUrlParam("s");//1为购物车，2为立即下单
	var totalAmount = {
		amount1:'',//人民币总价
		amount2:''//积分总价
	};
	var config = {
		productSpecsCode: spec,
		quantity: quantity,
		toUser:'',
		applyNote: $("#applyNote").val(),
		pojo:{}
	}
	var cartCodeList =[];
    
    init();

	function init(){
        base.showLoading(code);
        
        if(submitType==1){
        	$.when(
	        	getProductList(),
	        	isDefaultAddress()
	        )
        }else{
        	$.when(
	        	getProductDetail(code),
	        	isDefaultAddress()
	        )
        }
        
    	$("#toUser").attr('data-toUser',SYS_USER)
        base.hideLoading();
        addListener()
	}
	
	//购物车下单
	function getProductList(){
		/**
		 * carProList={
		 *	code: '',//购物车编号
		 *	productCode: '',//商品编号
		 *	advPic: '',//商品图片
		 *	name: '',//商品名
		 *	specsName: '',//规格名称
		 *	price: '',//价格
		 *	quantity: '',//数量
		 *	type: '',//商品类型
		 *}
		 * */
		
		var carSubProInfo = JSON.parse(sessionStorage.getItem('carSubProInfo'));
		var html = '';
		
		carSubProInfo.forEach(function(d, i){
			html += `<a class="mall-item" href="./mallDetail.html?code=${d.productCode}">
    		<div class="mall-item-img fl" style="background-image: url('${base.getImg(d.advPic)}');"></div>
    		<div class="mall-item-con fr">
    			<p class="name">${d.name}</p>
    			<samp class="slogan">商品规格：${d.specsName}</samp>
    			<div class="price wp100">
    				<samp class="samp1 fl">${d.type=='JF' ? base.formatMoney(d.price)+'积分' : '￥'+base.formatMoney(d.price)}</samp>
    				<samp class="samp2 fr">x${d.quantity}</samp>
    			</div></div></a>`;
    		
    		if(d.type=='JF'){
    			totalAmount.amount2+=d.price;
    		}else{
    			totalAmount.amount1+=d.price;
    		}
    		cartCodeList.push(d.code)
		})
    			
		$(".orderPro-list").html(html);
		$("#totalAmount").html('￥'+base.formatMoney(totalAmount.amount1) +'+'+ base.formatMoney(totalAmount.amount2)+'积分' )
		
	}
	
	//立即下单时获取详情
	function getProductDetail(c){
		MallCtr.getProductDetail(c).then((data)=>{
			
			var html = '';
			var specName,price;
			var type = data.type
			
			data.productSpecsList.forEach(function(d, i){
				if(d.code==spec){
					specName = d.name;
					price = type==JFPRODUCTTYPE ? base.formatMoney(d.price2)+'积分' : '￥'+base.formatMoney(d.price1)
					totalAmount.amount1 = d.price1;
					totalAmount.amount2 = d.price2;
				}
			})
			html = `<a class="mall-item" href="./mallDetail.html?code=${data.code}">
    		<div class="mall-item-img fl" style="background-image: url('${base.getImg(data.advPic)}');"></div>
    		<div class="mall-item-con fr">
    			<p class="name">${data.name}</p>
    			<samp class="slogan">商品规格：${specName}</samp>
    			<div class="price wp100">
    				<samp class="samp1 fl">${price}</samp>
    				<samp class="samp2 fr">x${quantity}</samp>
    			</div></div></a>`;
    			
			$(".orderPro-list").html(html);
			$("#totalAmount").html(type==JFPRODUCTTYPE ? base.formatMoney(totalAmount.amount2)+'积分' : '￥'+base.formatMoney(totalAmount.amount1))
			
		},()=>{})
	}
	
	//获取默认地址
	function isDefaultAddress(){
		UserCtr.getAddressList(true,{isDefault:1}).then((data)=>{
			var html = '';
			
			if(data.length){
				html = `<div class="icon icon-dz"></div>
				<div class="wp100 over-hide"><samp class="fl addressee">收货人：${data[0].addressee}</samp><samp class="fr mobile">${data[0].mobile}</samp></div>
				<div class="detailAddress">收货地址： ${data[0].province}  ${data[0].city}  ${data[0].district}  ${data[0].district}</div>
				<div class="icon icon-more"></div>`
				
				$(".orderAddress").html(html).attr('data-code',data[0].code)
				config.pojo ={
			    	receiver: data[0].addressee,
			        reMobile: data[0].mobile,
			        reAddress: data[0].province+' '+data[0].city+' '+data[0].district+' '+data[0].district,
			        applyUser: base.getUserId(),
			        companyCode: SYSTEM_CODE,
			        systemCode: SYSTEM_CODE
			    }
			}
		},()=>{})
		
	}
	
	//提交订单-立即下单
	function submitOrder1(param){
		base.showLoading()
		MallCtr.placeOrder(param,true).then((data)=>{
			base.hideLoading();
			$("#mask").removeClass('hidden');
			base.showMsg('下单成功！',1200)
			setTimeout(function(){
				location.href = '../pay/pay.html?code='+data+'&type=mall';
			},800)
		},()=>{})
	}
	
	//提交订单-购物车订单
	function submitOrder2(param){
		base.showLoading()
		MallCtr.carPlaceOrder(param,true).then((data)=>{
			base.hideLoading();
			$("#mask").removeClass('hidden');
			base.showMsg('下单成功！',1200)
			setTimeout(function(){
				location.href = '../pay/pay.html?code='+data+'&type=mall';
			},800)
		},()=>{})
	}
	
	function addListener(){
		AddressList.addCont({
            userId: base.getUserId(),
            success: function(res) {
            	config.pojo = res;
            }
        });
        
		ExpressList.addCont({
            success: function(to, toName) {
            	if(to){
            		$("#toUser").attr('data-toUser',to)
            		$("#toUser").find('.toUserName').children('samp').html(toName)
            	}
            }
        });
		
		//地址
		$(".orderAddress").click(function(){
			AddressList.showCont({
				code: $(this).attr('data-code')
			});
		})
		
		$("#subBtn").click(function(){
			config.toUser = $("#toUser").attr('data-toUser')
			var param={}
			if(submitType=='1'){
				param.pojo = config.pojo;
				param.toUser = config.toUser;
				param.cartCodeList=cartCodeList
				
				submitOrder2(param)
			}else{
				param=config
				
				submitOrder1(param)
			}
		})
		
		//配送方式
		$("#toUser").click(function(){
			ExpressList.showCont({});
		})
		
	}
	
})
