define([
    'app/controller/base',
    'swiper',
    'app/interface/LeaseCtr',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/util/handlebarsHelpers',
    'app/module/scroll',
    'app/module/weixin',
], function(base, Swiper, LeaseCtr, GeneralCtr, UserCtr, Handlebars, scroll, weixin) {
	var code = base.getUrlParam("code");
	var type ,
		yj_min_rate = 0,
		myScroll,
		zmScoreFalg = false,
		studentFalg = false;
	
    var _comTmpl = __inline('../../ui/comment-item.handlebars');
    
    init();
    
    function init(){
		base.showLoading();
        $.when(
        	getLeaseProductDetail(code),
        	getPageComment(),
        	getUser()
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
					html+=`<div class="swiper-slide"><div class="mallDetail-img" style="background-image: url('${base.getImg(d,'?imageMogr2/auto-orient/thumbnail/!900x900r')}')"></div></div>`;
				})
				$("#top-swiper").html(html);
				var mySwiper = new Swiper('#swiper-container', {
		            'paginationClickable' :true,
		            'preventClicksPropagation': true,
	                // 如果需要分页器
	                'pagination': '.swiper-pagination'
	            });
			}else{
				$("#top-swiper").html(`<div class="swiper-slide"><div class="mallDetail-img" style="background-image: url('${base.getImg(dpic,'?imageMogr2/auto-orient/thumbnail/!900x900r')}')"></div></div>`);
			}
			
			$('title').html(data.name+'-租赁详情');
			
			//微信分享
	        weixin.initShare({
	            title: data.name+'-商品详情',
	            desc: data.slogan,
	            link: location.href,
	            imgUrl: base.getImg(data.advPic)
	        });
			
			$(".detail-title .name").html(data.name)
			$(".detail-title .slogan").html(data.slogan)
			$(".detail-title .quantity i").html(data.quantity)
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
	
	//减免说明
	function getJmExplain(){
		LeaseCtr.getJmExplain('myj').then((data)=>{
			var html = '';
			html = `<h3>芝麻分减免说明<a href="${zmScoreFalg ? '../credit/zhiMaCredit.html' : '../credit/zhiMaCreditAccredit.html'}">(点击查看芝麻信用)</a></h3>
					<p>1.芝麻分大于等于${data.myj_zima_score1}时可减免￥${data.myj_zima_amount1}</p>
					<p>2.芝麻分大于等于${data.myj_zima_score2}时可减免￥${data.myj_zima_amount2}</p>
					<p>3.芝麻分大于等于${data.myj_zima_score3}时可减免￥${data.myj_zima_amount3}</p>
					<h3>学生减免说明<a href="${studentFalg ? '../credit/studentCredit.html' : '../credit/studentCreditAccredit.html'}">(点击查看学生信用)</h3>
					<p>1.学生可减免￥${data.myj_student_amount}</p>
					<h3>老用户减免说明</h3>
					<p>1.用户租赁${data.myj_rent_times}次后可减免￥${data.myj_rent_amount}</p>
					<samp>最小押金不得低于产品押金的${data.yj_min_rate*100}%</samp>`
			
			yj_min_rate = data.yj_min_rate
			
			$("#jMdialog #jMdialog-content div").html(html)
		},()=>{
			base.hideLoading();
		})
	}
	
	function getUser(){
		UserCtr.getUser().then((data)=>{
			if(data.zmScore){
				zmScoreFalg = true
				$("#isAccredit").attr('href','../credit/zhiMaCredit.html')
				$("#zhiMaCreditt samp").html('已授权芝麻信用')
			}else{
				
				zmScoreFalg = false
				$("#isAccredit").attr('href','javascript:void(0)')
				$("#zhiMaCreditt").addClass("bindZhiMa");
				$("#zhiMaCreditt samp").html('绑定芝麻信用享受 '+(1-yj_min_rate)*100+'% 押金减免服务')
			}
			
			if(data.gradDatetime){
				
				studentFalg = true
			}else{
				studentFalg = false
			}
			
			getJmExplain();
		})
	}
	
    function addListener(){
    	
		//收藏
		$("#collect").click(function(){
			
			base.showLoading();
			if($(this).hasClass('active')){
				//取消收藏
				GeneralCtr.cancelCollecte(code,'RP').then(()=>{
					$(this).removeClass('active')
					base.hideLoading();
					base.showMsg('取消成功')
				},()=>{
					base.hideLoading();
				})		
			}else{
				
				//收藏
				GeneralCtr.addCollecte(code,'RP').then(()=>{
					$(this).addClass('active')
					base.hideLoading();
					base.showMsg('收藏成功')
				},()=>{
					base.hideLoading();
				})	
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
		var touchFalg=false;
		$("#jmDialog").click(function(){
        	$("#jMdialog").removeClass('hidden')
        	touchFalg = true
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
			myScroll.myScroll.refresh()
        })
        
        $(".dialog .close").click(function(){
        	$('.dialog').addClass('hidden');
        	touchFalg = false
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        })
		
		$("#isAccredit").on('click', '.bindZhiMa', function(){
        	$("#zMdialog").removeClass('hidden')
        	touchFalg = true
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
		})
		
		myScroll = scroll.getInstance().getScrollByParam({
            id: 'jMdialog-content',
            param: {
                eventPassthrough: true,
                snap: true,
                hideScrollbar: true,
                hScroll: true,
                hScrollbar: false,
                vScrollbar: false
            }
        });
		
		//v1.1.0
		//详情 评价 tag切换
		$("#detailNav .nav").click(function(){
			$(this).addClass("active").siblings(".nav").removeClass("active");
			$(".contentWrap").eq($(this).index()).removeClass("hidden").siblings(".contentWrap").addClass("hidden");
		})
    }
});
