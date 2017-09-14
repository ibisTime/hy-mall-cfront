define([
    'app/controller/base',
    'swiper',
    'app/interface/MallCtr',
], function(base, Swiper, MallCtr) {
	
    init();

	function init(){
		base.showLoading();
		getCarProductList();
        addListener();
        
	}
	
	//获取购物车商品列表
	function getCarProductList(){
		MallCtr.getCarProductList().then((data)=>{
			var html = '';
			if(data.length){
				data.forEach(function(d, i){
					html += `<div class="car-item mb20" data-code=${d.code} data-status=${d.product.status} data-type='${d.productSpecs.price2 ? 'JF' : 'CNY'}'>
						<div class="icon"><i></i></div>
						<a class="mall-item" data-pcode='${d.productCode}' href="./mallDetail.html?code=${d.productCode}">
				    		<div class="mall-item-img fl" data-advPic='${d.product.advPic}' style="background-image: url('${base.getImg(d.product.advPic)}');"></div>
				    		<div class="mall-item-con fr">
				    			<p class="name">${d.product.name}</p>
				    			<p class="slogan specsName" data-sName='${d.productSpecs.name}'>商品规格：${d.productSpecs.name}</p>
				    			<div class="price wp100">
				    				<samp class="samp1 fl" data-price='${d.productSpecs.price2 ? d.productSpecs.price2: d.productSpecs.price1}'
				    				>${d.productSpecs.price2 ? base.formatMoney(d.productSpecs.price2)+'积分' : '￥'+base.formatMoney(d.productSpecs.price1)}</samp>
				    			</div>
				    		</div>
				    	</a>
				    	<div class="productSpecs-number">
							<div class="subt fl"></div><div class="sum fl" data-quantity='${d.productSpecs.quantity}'>${d.quantity}</div><div class="add fl"></div>
						</div>
						<div class='carProDelete'></div>
					</div>`;
				})
				
				$("#carProList").html(html);
				
				$(".carContent").removeClass('hidden')
				$(".carNoData").addClass('hidden')
			}else{
				$(".carContent").addClass('hidden')
				$(".carNoData").removeClass('hidden')
			}
			
			base.hideLoading()
			
		},()=>{})
	}
	
	//获取选中的商品的总价
	function getTotalAmount(){
		var totalAmount = {//总价
			amount1: 0,//人民币总价
			amount2:0//积分总价
		}
		var flag = 1;// 是否全选
		$("#carProList .car-item").each(function(i, d){
			if($(this).hasClass('active')){
				//选中商品数据
				var carProList={
					code: $(this).attr('data-code'),//购物车编号
					price: $(this).find('.samp1').attr('data-price'),//价格
					quantity: $(this).find('.sum').html(),//数量
					type: $(this).attr('data-type'),//商品类型
				}
				
				
				if(carProList.type=='CNY'){
					totalAmount.amount1+= carProList.price*carProList.quantity
				}else{
					totalAmount.amount2+= carProList.price*carProList.quantity
				}
			}else{
				flag = 0
			}
		})
		if(flag){
			$("#allCheck").addClass('active');
		}else{
			$("#allCheck").removeClass('active');
		}
		$("#totalAmount").html('￥'+base.formatMoney(totalAmount.amount1))
	}
	
	//购买
	function carPlaceOrder(){
		var carSubProInfo = [];//cartCodeList
		var flag = false;//是否有下架商品 true(有)
		if($("#carProList .car-item").hasClass('active')){
			$("#carProList .car-item").each(function(i, d){
				
				if($(this).hasClass('active')){
					
					//下架商品
					if($(this).attr('data-status')==4){
						base.showMsg('商品：'+$(this).find('.name').html()+'已下架，不能购买');
						flag = true;
						return false;
					}
					
					if($(this).find('.sum').attr('data-quantity')<1){
						
						base.showMsg('商品：'+$(this).find('.name').html()+'已无库存，不能购买');
						flag = true;
						return false;
					}
					
					//选中商品数据
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
			
			//无下架商品跳转支付
			if(!flag){
				sessionStorage.setItem('carSubProInfo',JSON.stringify(carSubProInfo))
			
				location.href = './submitOrder.html?s=1';
			}
			
		}else{
			base.showMsg('请至少选择一个商品！')
		}
		
	}
	
	//编辑购物车商品数量
	function editCarPro(param){
		base.showLoading()
		MallCtr.editCarPro(param).then((data)=>{
			getTotalAmount();
			base.hideLoading();
		},()=>{})
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
			
			var param = {
				code:$(this).parent().parent('.car-item').attr('data-code'),
				quantity: sum
			}
			editCarPro(param)
			$(this).siblings('.sum').html(sum);
		})
		
		//购买数量 加
		$("#carProList").on('click', '.car-item .productSpecs-number .add', function(){
			var sum = +$(this).siblings('.sum').html()
			if(sum<$(this).siblings('.sum').attr('data-quantity')){
				sum++
			}
			
			var param = {
				code:$(this).parent().parent('.car-item').attr('data-code'),
				quantity: sum
			}
			editCarPro(param)
			$(this).siblings('.sum').html(sum);
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
		
		//确认购买按钮
		$("#subBtn").click(function(){
			carPlaceOrder();
		})
		
		//删除商品
		$("#carProList").on('click', '.carProDelete', function(){
			base.confirm('确定删除该商品？').then(()=>{
				base.showLoading();
				
				var param={
					cartCodeList:[]
				};
				param.cartCodeList.push($(this).parent('.car-item').attr('data-code'))
				
				MallCtr.detailCarPro(param).then(()=>{
					getCarProductList()
				},()=>{
					base.hideLoading()
				})
			},()=>{})
		})
	}
	
	
})
