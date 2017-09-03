define([
    'app/controller/base',
    'swiper',
    'app/interface/MallCtr',
], function(base, Swiper, MallCtr) {
	var code = base.getUrlParam("code");
	var type ;
	
    init();

	function init(){
		base.showLoading();
        addListener();
        getProductDetail(code);
        
	}
	
	//获取商品详情
	function getProductDetail(c){
		
		MallCtr.getProductDetail(c).then((data)=>{
			
			type = data.type;
			
			var dpic = data.pic;
	        var strs= []; //定义一数组 
			var html="";
			strs=dpic.split("||"); //字符分割
			
			if(strs.length>1){
				strs.forEach(function(d, i){
					html+='<div class="swiper-slide"><div class="mallDetail-img" style="background-image: url('+ base.getImg(d) + ')"></div></div>';
				})
				$("#top-swiper").html(html);
				var mySwiper = new Swiper('#swiper-container', {
	                'direction': 'horizontal',
	                'loop': true,
		            'autoplayDisableOnInteraction': false,
	                // 如果需要分页器
	                'pagination': '.swiper-pagination'
	            });
			}else{
				$("#top-swiper").html('<div class="swiper-slide"><img class="wp100" src="' + base.getImg(dpic) + '"></div>');
			}
			$('title').html(data.name+'-商品详情');
			$(".mallDetail-title .name").html(data.name)
			$(".mallDetail-title .slogan").html(data.slogan)
			$(".mallDetail-title .name").html(data.name)
			$(".mallDetail-title .name").html(data.name)
			$("#content").html(data.description)
			
			$("#productSpecs .productSpecs-img").css('background-image','url("'+base.getImg(data.advPic)+'")')
			$("#productSpecs .price").html(type==JFPRODUCTTYPE ? base.formatMoney(data.productSpecsList[0].price2)+'积分' : '￥'+base.formatMoney(data.productSpecsList[0].price1))
			$("#productSpecs .quantity").html('库存 ' + data.productSpecsList[0].quantity).attr('data-quantity',data.productSpecsList[0].quantity)
			$("#productSpecs .choice i").html(data.productSpecsList[0].name)
			
			//规格
			var specHtml = "";
			data.productSpecsList.forEach(function(d, i){
				specHtml+=`<p class='${i==0 ? "active" :""}' 
					data-code='${d.code}'
					data-price='${type==JFPRODUCTTYPE ? d.price2 : d.price1}' 
					data-quantity=${d.quantity} 
					data-name=${d.name} >
					${d.name}  重量: ${d.weight}kg  发货地: ${d.province}</p>`
			})
			
			$("#productSpecs .spec").html(specHtml)
			
			base.hideLoading();
		},()=>{})
	}
	
	//显示商品规格面板
	function showProductSpecs(t){
		//t=1,加入购物车；t=2,立即下单
		$("#mask").removeClass('hidden');
		$("#subBtn").removeClass('purchaseBtn').removeClass('addSCarBtn');
		$("#productSpecs").addClass('active');
		
		if(t==1){
			$("#subBtn").html('加入购物车').addClass('addSCarBtn')
		}else{
			$("#subBtn").html('立即下单').addClass('purchaseBtn')
		}
		getSubBtn();
	}
	
	//关闭商品规格面板
	function closeProductSpecs(){
		$("#mask").addClass('hidden');
		$("#productSpecs").removeClass('active');
		
		//还原选中数据
		var _specP = $("#productSpecs .spec p").eq(0);
		
		_specP.addClass('active').siblings().removeClass('active');
		$("#productSpecs .price").html(type==JFPRODUCTTYPE ? base.formatMoney(_specP.attr("data-price"))+'积分' : '￥'+base.formatMoney(_specP.attr("data-price")))
		$("#productSpecs .quantity").html('库存 ' + _specP.attr("data-quantity")).attr('data-quantity',_specP.attr("data-quantity"))
		$("#productSpecs .choice i").html(_specP.attr("data-name"))
		$('#productSpecs .productSpecs-number .sum').html(1)
	}
	
	function addShoppingCar(param){
		base.showLoading();
		MallCtr.addShoppingCar(param).then(()=>{
			base.hideLoading();
			base.confirm('加入成功，是否前往购物车?').then(()=>{
				location.href='./shoppingCar.html';
			},()=>{})
		},()=>{})
	}
	
	function getSubBtn(t){
		//t=1,加入购物车；t=2,立即下单
		if($("#productSpecs .quantity").attr('data-quantity')<1){
			$("#subBtn").addClass("am-button-disabled").removeClass("am-button-red")
			
			if(t==1){
				$("#subBtn").removeClass('addSCarBtn')
			}else{
				$("#subBtn").removeClass('purchaseBtn')
			}
		}else{
			$("#subBtn").removeClass("am-button-disabled").addClass("am-button-red")
		}
	}
	
	function addListener(){
		var mySwiper = new Swiper('#swiper-container', {
            'direction': 'horizontal',
            'loop': false,
            'autoplayDisableOnInteraction': false,
            // 如果需要分页器
            'pagination': '.swiper-pagination'
        });
		
		//立即购买
		$(".buyBtn").click(function(){
			showProductSpecs(2)
		})
		
		//加入购物车
		$(".addShoppingCarBtn").click(function(){
			showProductSpecs(1)
		})
		
		//关闭商品规格
		$("#productSpecs .close").click(function(){
			closeProductSpecs();
		})
		
		//规格点击
		$("#productSpecs .spec").on('click', 'p', function(){
			var _specP = $(this);
			
			_specP.addClass('active').siblings().removeClass('active');
			$("#productSpecs .price").html(type==JFPRODUCTTYPE ? base.formatMoney(_specP.attr("data-price"))+'积分' : '￥'+base.formatMoney(_specP.attr("data-price")))
			$("#productSpecs .quantity").html('库存 ' + _specP.attr("data-quantity")).attr('data-quantity',_specP.attr("data-quantity"))
			$("#productSpecs .choice i").html(_specP.attr("data-name"))
			$('#productSpecs .productSpecs-number .sum').html(1)
			
			getSubBtn();
		})
		
		//购买数量 减
		$('.productSpecs-number .subt').click(function(){
			var sum = +$('#productSpecs .productSpecs-number .sum').html()
			if(sum>1){
				sum--
			}
			$('#productSpecs .productSpecs-number .sum').html(sum)
		})
		
		//购买数量 加
		$('.productSpecs-number .add').click(function(){
			var sum = +$('#productSpecs .productSpecs-number .sum').html()
			if(sum<$("#productSpecs .quantity").attr('data-quantity')){
				sum++
			}
			$('#productSpecs .productSpecs-number .sum').html(sum)
		})
		
		//商品规格-加入购物车
		$('#productSpecs').on('click', '.addSCarBtn', function(){
			var param ={
				productSpecsCode: $("#productSpecs .spec p.active").attr('data-code'),
		    	quantity: $('#productSpecs .productSpecs-number .sum').html()
			}
			addShoppingCar(param);
			
		})
		
		//商品规格-立即下单
		$('#productSpecs').on('click', '.purchaseBtn', function(){
			location.href = './submitOrder.html?s=2&code='+code+'&spec='+$("#productSpecs .spec p.active").attr('data-code')+'&quantity='+$('#productSpecs .productSpecs-number .sum').html();
		})
		
	}
	
	
})
