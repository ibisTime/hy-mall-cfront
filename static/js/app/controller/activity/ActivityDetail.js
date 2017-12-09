define([
    'app/controller/base',
    'swiper',
    'app/interface/GeneralCtr'
], function(base, Swiper, GeneralCtr) {
	var code = base.getUrlParam("code");
    init();

	function init(){
		
		addListener()
		var mySwiper = new Swiper('#swiper-container', {
            'paginationClickable' :true,
            'preventClicksPropagation': true,
            // 如果需要分页器
            'pagination': '.swiper-pagination'
        });
	}
	
	function addListener(){
		
		//返回顶部
        $("#goTop").click(()=>{
            var speed=200;//滑动的速度
            $('body,html').animate({ scrollTop: 0 }, speed);
            return false;
        })
        
        //详情tag切换
		$("#detailNav .nav").click(function(){
			$(this).addClass("active").siblings(".nav").removeClass("active");
			$(".contentWrap").eq($(this).index()).removeClass("hidden").siblings(".contentWrap").addClass("hidden");
		})
		
		//关闭请选择弹窗
		$(".am-modal-mask").click(function(){
			$(".dialog").addClass("hidden")
		})
		
		//我要咨询 点击
		$("#consultBtn").click(function(){
			$("#consultDialog").removeClass("hidden")
		})
		
		//我想去玩 点击
		$("#wantPalyBtn").click(function(){
			
			//是否勾选 “我已确认并知晓上述活动事项”
			if($("#confirm").hasClass("active")){
				$("#chooseDialog").removeClass("hidden")
			}else{
				var h = Math.max(document.body.scrollHeight,document.documentElement.scrollHeight); //文档内容实际高度 
				$(document).scrollTop(h);
				base.showMsg("请先确认活动事项！")
			}
		})
		
		//“我已确认并知晓上述活动事项” 点击
		$("#confirm").click(function(){
			$(this).toggleClass('active')
		})
		
		//“选择装备” 点击
		$("#chooseProductBtn").click(function(){
			location.href="../activity/activity-choose.html?code="+code
		})
		
		//“直接报名” 点击
		$("#subBtn").click(function(){
			location.href="../activity/submitOrder.html?type=1&code="+code
		})
		
		
	}
})
