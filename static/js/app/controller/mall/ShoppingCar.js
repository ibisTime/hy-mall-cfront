define([
    'app/controller/base',
    'swiper',
    'app/interface/MallCtr',
], function(base, Swiper, MallCtr) {
	
    init();

	function init(){
//		base.showLoading();
		getCarProductList();
        addListener();
        
	}
	
	//获取购物车商品列表
	function getCarProductList(){
		MallCtr.getCarProductList().then((data)=>{
			var html = '';
			
			data.forEach(function(d, i){
				html += `<div class="car-item mb20" data-code=${d.code} data-status=${d.product.status} data-type='${d.productSpecs.price2 ? 'JF' : 'CNY'}'>
					<div class="icon"><i></i></div>
					<a class="mall-item" data-pcode='${d.productCode}' href="./mallDetail.html?code=${d.productCode}">
			    		<div class="mall-item-img fl" data-advPic='${d.product.advPic}' style="background-image: url('${base.getImg(d.product.advPic)}');"></div>
			    		<div class="mall-item-con fr">
			    			<p class="name">${d.product.name}</p>
			    			<p class="slogan specsName" data-sName='${d.productSpecs.name}'>商品规格：${d.productSpecs.name}</p>
			    			<div class="price wp100">
			    				<samp class="samp1 fl" data-price='${d.productSpecs.price2 ? d.productSpecs.price2: d.productSpecs.price1}'>${d.productSpecs.price2 ? base.formatMoney(d.productSpecs.price2)+'积分' : '￥'+base.formatMoney(d.productSpecs.price1)}</samp>
			    			</div>
			    		</div>
			    	</a>
			    	<div class="productSpecs-number">
						<div class="subt fl"></div><div class="sum fl" data-quantity='${d.productSpecs.quantity}'>${d.quantity}</div><div class="add fl"></div>
					</div>
				</div>`;
			})
			
			$("#carProList").html(html)
			
		},()=>{})
	}
	
	//获取选中的商品的总价
	function getTotalAmount(){
	}
	
	//购买
	function carPlaceOrder(){
		var carSubProInfo = [];//cartCodeList
		var flag = false;//是否有下架商品 true(有)
		if($("#carProList .car-item").hasClass('active')){
			$("#carProList .car-item").each(function(i, d){
				
				if($(this).hasClass('active')){
					
					if($(this).attr('data-status')==4){
						base.showMsg('商品：'+$(this).find('.name').html()+'已下架，不能购买');
						flag = true;
						return false;
					}
					
					var carProList={
						code: $(this).attr('data-code'),//购物车编号
						productCode: $(this).find('.mall-item').attr('data-pcode'),//商品编号
						advPic: $(this).find('.mall-item-img').attr('data-advPic'),//商品图片
						name: $(this).find('.name').html(),//商品名
						specsName: $(this).find('.specsName').attr('data-sName'),//规格名称
						price: $(this).find('.samp1').attr('data-price'),//价格
						quantity: $(this).find('.sum').html(),//数量
						type: $(this).attr('data-type'),//商品类型
					}
					
					carSubProInfo.push(carProList)
				}
			})
			if(!flag){
				sessionStorage.setItem('carSubProInfo',JSON.stringify(carSubProInfo))
			
				location.href = './submitOrder.html?s=1';
			}
			
		}else{
			base.showMsg('请至少选择一个商品！')
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
		
		//购买数量 减
		$("#carProList").on('click', '.car-item .productSpecs-number .subt', function(){
			var sum = +$(this).siblings('.sum').html()
			if(sum>1){
				sum--
			}
			$(this).siblings('.sum').html(sum);
			getTotalAmount();
		})
		
		//购买数量 加
		$("#carProList").on('click', '.car-item .productSpecs-number .add', function(){
			var sum = +$(this).siblings('.sum').html()
			if(sum<$(this).siblings('.sum').attr('data-quantity')){
				sum++
			}
			$(this).siblings('.sum').html(sum);
			getTotalAmount();
		})
		
		
		//商品规格-立即下单
		$('#productSpecs').on('click', '.purchaseBtn', function(){
			location.href = './submitOrder.html?s=2&code='+code+'&spec='+$("#productSpecs .spec p.active").attr('data-code')+'&quantity='+$('#productSpecs .productSpecs-number .sum').html();
		})
		
		//全选
		$("#allCheck").click(function(){
			
			if($(this).hasClass('active')){
				$(this).removeClass('active');
				$("#carProList .car-item").removeClass('active');
			}else{
				$(this).addClass('active');
				$("#carProList .car-item").addClass('active');
			}
			//获取选中商品总价
			getTotalAmount();
		})
		
		//商品列表点击
		$("#carProList").on('click', '.car-item .icon', function(){
			if($(this).parent('.car-item').hasClass('active')){
				$(this).parent('.car-item').removeClass('active');
			}else{
				$(this).parent('.car-item').addClass('active');
				
			}
			//获取选中商品总价
			getTotalAmount();
		})
		
		$("#subBtn").click(function(){
			carPlaceOrder();
		})
		
	}
	
	
})