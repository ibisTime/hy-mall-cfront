define([
    'app/controller/base',
    'swiper',
    'app/interface/MallCtr',
    'app/interface/GeneralCtr',
    'app/util/handlebarsHelpers',
    'app/module/weixin',
], function(base, Swiper, MallCtr, GeneralCtr, Handlebars, weixin) {
	var code = base.getUrlParam("code");
	var type,
		btnType;// 1: 加入购物车，2：立即下单
		
    var _comTmpl = __inline('../../ui/comment-item.handlebars');
    
	//为点击事件搭建关系
	var specsArray1 ={};//规格1['规格1':{['规格2'：'code']},'规格1':{['规格2'：'code']}]
	var specsArray2 ={};//规格2['规格2':{['规格1'：'规格1']},'规格2':{['规格1'：'规格1']}]
	
    init();

	function init(){
		base.showLoading();
        $.when(
        	getProductDetail(code),
        	getPageComment(),
        	getPageCarProduct()
        )
        addListener();
	}
	
	//获取商品详情
	function getProductDetail(c){
		
		MallCtr.getProductDetail(c).then((data)=>{
			
			type = data.category;
			
			if(data.status=='4'){
				$(".mallBottom-right .offSelf").removeClass('hidden');
				$(".mallBottom-right .addShoppingCarBtn").addClass('hidden')
				$(".mallBottom-right .buyBtn").addClass('hidden')
			}else{
				if(type==JFPRODUCTTYPE){
//					$(".mallBottom-right .addShoppingCarBtn").removeClass("addShoppingBg").addClass("addShoppingBg-disabled").off("click")

					$(".mallBottom-right .buyBtn").removeClass('hidden').css('width','100%')
				}else{
					
					$(".mallBottom-right .addShoppingCarBtn").removeClass('hidden')
					$(".mallBottom-right .buyBtn").removeClass('hidden')
				}
				
				
				$(".mallBottom-right .offSelf").addClass('hidden');
			}
			
			var dpic = data.pic;
	        var strs= []; //定义一数组 
			var html="";
			strs=dpic.split("||"); //字符分割
			
			if(strs.length>1){
				strs.forEach(function(d, i){
					html+=`<div class="swiper-slide"><div class="mallDetail-img" style="background-image: url('${base.getImg(d)}')"></div></div>`;
				})
				$("#top-swiper").html(html);
				var mySwiper = new Swiper('#swiper-container', {
		            'paginationClickable' :true,
		            'preventClicksPropagation': true,
	                // 如果需要分页器
	                'pagination': '.swiper-pagination'
	            });
			}else{
				$("#top-swiper").html(`<div class="swiper-slide"><div class="mallDetail-img" style="background-image: url('${base.getImg(dpic)}')"></div></div>`);
			}
			
			$('title').html(data.name+'-商品详情');
			
			//微信分享
	        weixin.initShare({
	            title: data.name+'-商品详情',
	            desc: data.slogan,
	            link: location.href,
	            imgUrl: base.getImg(data.advPic)
	        });
			
			$(".mallDetail-title .name").html(data.name)
			$(".mallDetail-title .slogan").html(data.slogan)
			$("#content").html(data.description)
			$("#specsName1").html(data.specsName1)
			$("#specsName2").html(data.specsName2)
			if(data.specsName2){
				$("#specs2").removeClass("hidden")
				$("#specs2").addClass("productSpecs-wrap")
				$("#specs1").removeClass("productSpecs-wrap")
			}else{
				$("#specs2").addClass("hidden")
				$("#specs1").addClass("productSpecs-wrap")
				$("#specs2").removeClass("productSpecs-wrap")
			}
			
			$("#productSpecs .productSpecs-img").css('background-image','url("'+base.getImg(data.productSpecsList[0].pic)+'")')
			$("#productSpecs .price").html(type==JFPRODUCTTYPE ? base.formatMoney(data.productSpecsList[0].price2)+'积分' : '￥'+base.formatMoney(data.productSpecsList[0].price1))
			$("#productSpecs .quantity").html('库存 ' + data.productSpecsList[0].quantity).attr('data-quantity',data.productSpecsList[0].quantity)
			$("#productSpecs .choice i").html(data.productSpecsList[0].name)
			
			//规格
			var specHtml1 = "";
			var specHtml2 = "";
			var specsName1List =[];
			var specsName2List =[];
			
			data.productSpecsList.forEach(function(d, i){
				if(data.specsName2){
					if(!specsName1List[d.specsVal1]){
						specHtml1+=`<p class='inStock' >${d.specsVal1}</p>`;
						specsName1List[d.specsVal1]=d.specsVal1;
						
					}
					//为点击事件搭建关系
					var tmpl1 = {};
					tmpl1[d.specsVal2]=d.code;
					$.extend(tmpl1, specsArray1[d.specsVal1])
					specsArray1[d.specsVal1]=tmpl1
					
					var tmpl2 = {};
					tmpl2[d.specsVal1]=d.specsVal1;
					$.extend(tmpl2, specsArray2[d.specsVal2])
					specsArray2[d.specsVal2]=tmpl2
					
				}else{
					specHtml1+=`<p class='${d.quantity=="0"?"":"inStock"}' 
						data-code='${d.code}'
						data-price='${type==JFPRODUCTTYPE ? d.price2 : d.price1}' 
						data-quantity=${d.quantity} 
						data-name=${d.specsVal1} 
						data-pic=${d.pic} >${d.specsVal1}</p>`;
					
					specsName1List[d.specsVal1]=d.specsVal1;
				}
				if(data.specsName2&&!specsName2List[d.specsVal2]){
					var inStock = '';
					if(d.quantity!='0'){
						inStock = "inStock";
					}else{
						inStock = ""
					}
					
					specHtml2+=`<p class='${inStock}' 
						data-code='${d.code}'
						data-price='${type==JFPRODUCTTYPE ? d.price2 : d.price1}' 
						data-quantity='${d.quantity}' 
						data-name='${d.specsVal2}'  
						data-specsVal1='${d.specsVal1}'  
						data-pic='${d.pic}' >${d.specsVal2}</p>`;
					
					specsName2List[d.specsVal2]=d.specsVal2;
				}
			})
			$("#specs1 .spec").html(specHtml1);
			$("#specs2 .spec").html(specHtml2);
			
			if(data.specsName2){
				//有规格2时为规格1绑定点击事件
				$("#specs1 .spec").on('click','p.inStock',function(){
					var _specPInStock = $(this);
					_specPInStock.addClass('active').siblings().removeClass('active');
					
					//规格2
					$("#specs2 .spec p").removeClass("inStock");
					//遍历规格2 为属于当前点击规格的规格2 添加inStock
					$("#specs2 .spec p").each(function(i, d){
						var _specP = $(this);
						
						//遍历出当前点击规格1 关联的规格2
						Object.keys(specsArray1[_specPInStock.text()]).forEach(function(v, j){
							if(_specP.attr("data-name")==v &&_specP.attr("data-quantity")!='0'){//显示 规格1的 规格
								_specP.addClass("inStock");
							}
						})
					})
					
				})
				
				//有规格2时为规格2绑定点击事件
				$("#specs2 .spec").on('click','p.inStock',function(){
					var _specP = $(this);
					_specP.addClass('active').siblings().removeClass('active');
					
					$("#specs1 .spec p").removeClass("inStock");
					//遍历规格1  为当前点击规格属于的规格1 添加inStock
					$("#specs1 .spec p").each(function(i, d){
						var _specs_specP= $(this);
						
						//遍历出当前点击规格2 关联的规格1
						Object.keys(specsArray2[_specP.attr("data-name")]).forEach(function(v, j){
							if(_specs_specP.text()==v &&_specP.attr("data-quantity")!='0'){//显示 规格1的 规格
								_specs_specP.addClass("inStock");
							}
						})
					})
					
					$("#productSpecs .price").html(type==JFPRODUCTTYPE ? base.formatMoney(_specP.attr("data-price"))+'积分' : '￥'+base.formatMoney(_specP.attr("data-price")))
					$("#productSpecs .quantity").html('库存 ' + _specP.attr("data-quantity")).attr('data-quantity',_specP.attr("data-quantity"))
					$("#productSpecs .choice i").html($("#specs1 .spec p.active").text()+' '+_specP.attr("data-name"))
					$("#productSpecs .productSpecs-img").css('background-image','url("'+base.getImg(_specP.attr("data-pic"))+'")')
					$('#productSpecs .productSpecs-number .sum').html(1)
					
					getSubBtn();
				})
				
			}else{
				//没有规格2时为规格1绑定点击事件
				$("#specs1 .spec").on('click','p.inStock', function(){
					var _specP = $(this);
					
					_specP.addClass('active').siblings().removeClass('active');
					$("#productSpecs .price").html(type==JFPRODUCTTYPE ? base.formatMoney(_specP.attr("data-price"))+'积分' : '￥'+base.formatMoney(_specP.attr("data-price")))
					$("#productSpecs .quantity").html('库存 ' + _specP.attr("data-quantity")).attr('data-quantity',_specP.attr("data-quantity"))
					$("#productSpecs .choice i").html(_specP.attr("data-name"))
					$("#productSpecs .productSpecs-img").css('background-image','url("'+base.getImg(_specP.attr("data-pic"))+'")')
					$('#productSpecs .productSpecs-number .sum').html(1)
					
					getSubBtn();
				})
			}
			
			//收藏
			data.isCollect=='1'?$("#collect").addClass("active"):$("#collect").removeClass("active")
			
			base.hideLoading();
		},()=>{})
	}
	
	//获取购物车商品
	function getPageCarProduct(){
		MallCtr.getPageCarProduct({
	        start: 1,
	        limit: 1,
		}).then((data)=>{
			
			if(data.list.length){
				$(".mallBottom-left .shoppingCar").addClass('active')
			}
		})
	}
	
	//获取评价
	function getPageComment(){
		GeneralCtr.getPageComment({
			start: 1,
        	limit: 1,
        	entityCode: code
		}, true).then((data)=>{
			var lists = data.page.list
			if(data.page.list.length){
				
				$('#commentList').html(_comTmpl({items: lists}))
				$('.allComment').removeClass('hidden')
			}else{
				$('#commentList').html('<li class="no-data">暂无评价</li>')
				$('.allComment').addClass('hidden')
			}
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
		getSubBtn(t);
	}
	
	//关闭商品规格面板
	function closeProductSpecs(){
		$("#mask").addClass('hidden');
		$("#productSpecs").removeClass('active');
		
		//还原选中数据
		var _specP1 = $("#specs1 .spec p").eq(0);
		var _specP2 = $("#specs2 .spec p").eq(0);
		
		$("#specs1 .spec p").removeClass("inStock").addClass("inStock").removeClass("active");
		$("#specs2 .spec p").removeClass("inStock").addClass("inStock").removeClass("active");
		
		if($("#specs2").hasClass('hidden')){//只有规格1
			$("#productSpecs .price").html(type==JFPRODUCTTYPE ? base.formatMoney(_specP1.attr("data-price"))+'积分' : '￥'+base.formatMoney(_specP1.attr("data-price")))
			$("#productSpecs .quantity").html('库存 ' + _specP1.attr("data-quantity")).attr('data-quantity',_specP1.attr("data-quantity"))
			$("#productSpecs .choice i").html(_specP1.attr("data-name"))
			$("#productSpecs .productSpecs-img").css('background-image','url("'+base.getImg(_specP1.attr("data-pic"))+'")')
			$('#productSpecs .productSpecs-number .sum').html(1)
		}else{
			$("#productSpecs .price").html(type==JFPRODUCTTYPE ? base.formatMoney(_specP2.attr("data-price"))+'积分' : '￥'+base.formatMoney(_specP2.attr("data-price")))
			$("#productSpecs .quantity").html('库存 ' + _specP2.attr("data-quantity")).attr('data-quantity',_specP2.attr("data-quantity"))
			$("#productSpecs .choice i").html(_specP2.attr("data-name"))
			$("#productSpecs .productSpecs-img").css('background-image','url("'+base.getImg(_specP2.attr("data-pic"))+'")')
			$('#productSpecs .productSpecs-number .sum').html(1)
		}
		
	}
	
	//加入购物车
	function addShoppingCar(param){
		base.showLoading();
		MallCtr.addShoppingCar(param).then(()=>{
			base.hideLoading();
			base.confirm('加入成功，是否前往购物车?').then(()=>{
				location.href='./shoppingCar.html';
			},()=>{})
		},()=>{})
	}
	
	//获取下单方式
	function getSubBtn(){
		//t=1,加入购物车；t=2,立即下单
		if($("#productSpecs .quantity").attr('data-quantity')<1){
			$("#subBtn").addClass("am-button-disabled").removeClass("am-button-red")
			
			if(btnType==1){
				$("#subBtn").removeClass('addSCarBtn')
			}else{
				$("#subBtn").removeClass('purchaseBtn')
			}
		}else{
			$("#subBtn").removeClass("am-button-disabled").addClass("am-button-red")
			
			if(btnType==1){
				$("#subBtn").addClass('addSCarBtn')
			}else{
				$("#subBtn").addClass('purchaseBtn')
			}
		}
	}
	
	
	function addListener(){
		//立即购买
		$(".buyBtn").click(function(){
			btnType = 2;
			showProductSpecs(btnType)
		})
		
		//加入购物车
		$(".addShoppingBg").click(function(){
			btnType = 1;
			showProductSpecs(btnType)
		})
		
		//关闭商品规格
		$("#productSpecs .close").click(function(){
			closeProductSpecs();
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
				productSpecsCode: '',
		    	quantity: $('#productSpecs .productSpecs-number .sum').html()
			}
			if($("#specs2").hasClass('hidden')){//只有规格1
				param.productSpecsCode=$("#specs1 .spec p.active").attr('data-code');
			}else if($("#specs1 .spec p.active").text()&&$("#specs2 .spec p.active").attr('data-name')){
				param.productSpecsCode=specsArray1[$("#specs1 .spec p.active").text()][$("#specs2 .spec p.active").attr('data-name')];
			}else{
				base.showMsg('请选择商品规格')
			}
			
			if(param.productSpecsCode!=''&&param.productSpecsCode){
				addShoppingCar(param);
			}else{
				base.showMsg('请选择商品规格')
			}
			
		})
		
		//商品规格-立即下单
		$('#productSpecs').on('click', '.purchaseBtn', function(){
			if($("#specs2").hasClass('hidden')&&!$("#specs1 .spec p.active").text()){
				base.showMsg('请选择商品规格');
				return false;
			}
			if(!$("#specs2").hasClass('hidden')&&!$("#specs2 .spec p.active").text()){
				base.showMsg('请选择商品规格');
				return false;
			}
			if($("#specs2").hasClass('hidden')){//只有规格1
				var productSpecsCode=$("#specs1 .spec p.active").attr("data-code");
				
				location.href = './submitOrder.html?s=2&code='+code+'&spec='+ productSpecsCode +'&quantity='+$('#productSpecs .productSpecs-number .sum').html();
			}else{
				var productSpecsCode=specsArray1[$("#specs1 .spec p.active").text()][$("#specs2 .spec p.active").attr('data-name')];
				location.href = './submitOrder.html?s=2&code='+code+'&spec='+ productSpecsCode +'&quantity='+$('#productSpecs .productSpecs-number .sum').html();
			}

		})
		
		//收藏
		$("#collect").click(function(){
			base.showLoading();
			if($(this).hasClass('active')){
				//取消收藏
				GeneralCtr.cancelCollecte(code,'P').then(()=>{
					$(this).removeClass('active')
					base.hideLoading();
					base.showMsg('取消成功')
				},()=>{
					base.hideLoading();
				})		
			}else{
				
				//收藏
				GeneralCtr.addCollecte(code,'P').then(()=>{
					$(this).addClass('active')
					base.hideLoading();
					base.showMsg('收藏成功')
				},()=>{
					base.hideLoading();
				})	
			}
		})
		
		//查看所有评价
		$("#commentList").click(function(){
			location.href='../public/comment.html?code='+code
		})
		$("#allComment").click(function(){
			location.href='../public/comment.html?code='+code
		})
		
		//v1.1.0
		//详情 评价 tag切换
		$("#detailNav .nav").click(function(){
			$(this).addClass("active").siblings(".nav").removeClass("active");
			$(".contentWrap").eq($(this).index()).removeClass("hidden").siblings(".contentWrap").addClass("hidden");
		})
		
	}
	
	
})
