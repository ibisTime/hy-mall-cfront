define([
    'app/controller/base',
    'swiper',
    'app/interface/LeaseCtr',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/util/handlebarsHelpers',
], function(base, Swiper, LeaseCtr, GeneralCtr, UserCtr, Handlebars) {
	var code = base.getUrlParam("code");
	var type ;
	
    var _comTmpl = __inline('../../ui/comment-item.handlebars');
    
    init();
    
    function init(){
		base.showLoading();
        $.when(
        	getLeaseProductDetail(code),
        	getPageComment(),
        	getJmExplain(),
        	getZmCreditDetail()
        )
        addListener();
    }
    
    //获取商品详情
	function getLeaseProductDetail(c){
		
		LeaseCtr.getLeaseProductDetail(c).then((data)=>{
			
			if(data.status=='4'){
				$(".leaseBottomBtn1").addClass('hidden')
				$(".leaseBottomBtn2").removeClass('hidden');
			}else{
				$(".leaseBottomBtn1").removeClass('hidden');
				$(".leaseBottomBtn2").addClass('hidden')
			}
			
			type = data.type;
			
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
				$("#top-swiper").html('<div class="swiper-slide"><img class="wp100" src="' + base.getImg(dpic) + '"></div>');
			}
			
			$('title').html(data.name+'-租赁详情');
			$(".detail-title .name").html(data.name)
			$(".detail-title .slogan").html(data.slogan)
			$("#price").html(type==JFLEASEPRODUCTTYPE ? base.formatMoney(data.price2)+'<i>积分</i>' : '<i>￥</i>'+base.formatMoney(data.price1))
			$("#orPrice").html('原价：<i>￥'+base.formatMoney(data.originalPrice) + '</i>')
			$("#content").html(data.description)
			
			//收藏
			data.isCollect=='1'?$("#collect").addClass("active"):$("#collect").removeClass("active")
			
			base.hideLoading();
		},()=>{})
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

	//收藏
	function addCollecte(c){
		base.showLoading();
		GeneralCtr.addCollecte(c,'RP').then(()=>{
			
			getLeaseProductDetail(c);
			base.hideLoading();
		},()=>{
			base.hideLoading();
		})
	}
	
	//取消收藏
	function cancelCollecte(c){
		base.showLoading();
		GeneralCtr.cancelCollecte(c,'RP').then(()=>{
			getLeaseProductDetail(c);
			
			base.hideLoading();
		},()=>{
			base.hideLoading();
		})
	}
	
	function getJmExplain(){
		LeaseCtr.getJmExplain('myj').then((data)=>{
			var html = '';
			html = `<h3>芝麻分减免说明</h3>
					<p>1.芝麻分大于等于${data.myj_zima_score1}时可减免￥${data.myj_amount1}</p>
					<p>2.芝麻分大于等于${data.myj_zima_score2}时可减免￥${data.myj_amount2}</p>
					<p>3.芝麻分大于等于${data.myj_zima_score3}时可减免￥${data.myj_amount3}</p>
					<h3>学生减免说明</h3>
					<p>1.学生可减免${data.myj_std_amount}</p>
					<h3>老用户减免说明</h3>
					<p>1.用户租赁${data.myj_rent_times}次后可减免￥${data.myj_rent_amount}</p>
					<samp>押金最多减免每件租赁商品原价${data.yj_min_rate*100}%</samp>`
			
			$("#dialog .jmExplain-content").html(html)
		},()=>{
			base.hideLoading();
		})
	}
	
	function getZmCreditDetail(){
		UserCtr.getCreditDetail('zm_score').then((data)=>{
			if(data.result){
				
				$("#isAccredit").attr('href','../credit/zhiMaCredit.html')
				$("#isAccredit samp").html('已授权芝麻信用')
			}else{
				$("#isAccredit").attr('href','../credit/zhiMaCreditAccredit.html')
				$("#isAccredit samp").html('立即授权免押金')
			}
		})
	}
	
    function addListener(){
    	
		//收藏
		$("#collect").click(function(){
			
			if($(this).hasClass('active')){
				cancelCollecte(code)
			}else{
				addCollecte(code)
			}
		})
		
		//查看所有评价
		$("#allComment").click(function(){
			location.href='../public/comment.html?code='+code
		})
		
		//预约租赁
		$("#subBtn").click(function(){
			location.href = './submitOrder.html?code='+code;
		})
		
		//减免说明
		
		$("#jmDialog").click(function(){
        	$("#dialog").removeClass('hidden')
        })
        
        $("#dialog #close").click(function(){
        	$("#dialog").addClass('hidden')
        })
		
		
    }
});
