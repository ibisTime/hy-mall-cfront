define([
    'app/controller/base',
    'swiper',
    'app/module/weixin',
    'app/interface/GeneralCtr',
    'app/interface/ActivityStr'
], function(base, Swiper, weixin, GeneralCtr, ActivityStr) {
	var code = base.getUrlParam("code");
    init();

	function init(){
		
		base.showLoading();
		$.when(
			getUserSysConfig(),
			getActivityDetail(),
			getPageActComment()
		)
		addListener()
		
	}
	
	//获取详情
	function getActivityDetail(){
		return ActivityStr.getActivityDetail(code).then((data)=>{
			
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
			
			$('title').html(data.name+'-活动详情');
			//微信分享
	        weixin.initShare({
	            title: data.name+'-活动详情',
	            desc: data.slogan,
	            link: location.href,
	            imgUrl: base.getImg(data.advPic)
	        });
	        
	        $(".detail-title .name").html(data.name)
			$(".detail-title .slogan").html(data.slogan)
			$("#price").html('<i>￥</i>'+base.formatMoney(data.amount))
			$(".detail-title .enrollEndDatetime").text(base.formatDate(data.enrollEndDatetime, "yyyy-MM-dd"))
			$(".detail-title .data").text(base.formatDate(data.startDatetime, "yyyy-MM-dd")+"至"+base.formatDate(data.endDatetime, "yyyy-MM-dd"))
			$(".detail-title .userNum").text(data.groupNum)
			
			startActive($("#indexQd"),data.indexQd)
			startActive($("#indexNd"),data.indexNd)
			startActive($("#indexFj"),data.indexFj)
			
			$("#description").html(data.description)
			$("#amountDesc").html(data.amountDesc)
			$("#scheduling").html(data.scheduling)
			$("#equipment").html(data.equipment)
			$("#enrollNum").html(data.enrollNum)
			
			base.hideLoading()
		}, base.hideLoading)
	}
	
	//星星选中
	function startActive(starWrap,thisIndex){
		var _starWrap = starWrap,
			_thisIndex = thisIndex-1,
    		score = 1;
    	_starWrap.children('.star').removeClass("active")	
		_starWrap.children('.star').each(function(i, d){
			if(i<=_thisIndex){
				score = i+1;
				$(this).addClass('active')
			}
		})
		_starWrap.attr('data-score', score);
	}
	
	//获取 报名须知，免责申明，注意事项
	function getUserSysConfig(){
		return $.when(
			GeneralCtr.getUserSysConfig("act_enroll"),
			GeneralCtr.getUserSysConfig("act_mzsm"),
			GeneralCtr.getUserSysConfig("act_zysx"),
		).then(function(data1,data2,data3){
        	$("#act_enroll").html(data1.cvalue);
        	$("#act_mzsm").html(data2.cvalue);
        	$("#act_zysx").html(data3.cvalue);
		});
	}
	
	//分页查询评论
	function getPageActComment(){
		GeneralCtr.getPageActComment({
			start:1,
			limit:3,
			entityCode: code
		}).then((data)=>{
			var lists = data.list;
			if(data.list.length) {
                var html = "";
                lists.forEach((item,i) => {
                    html += buildHtml(item,i);
                });
                $("#tNcommentList").html(html);
                $("#allTNotesComment").removeClass("hidden");
                
            }else{
                $("#tNcommentList").html('<div class="no-data">暂无留言</div>');
            }
			base.hideLoading();
		})
	}
	function buildHtml(item,i){
		var toComment = "";
		if(item.parentComment){
			toComment = `<div class="toComment">
    						<p class="toNickName">回复@<samp>${item.parentComment.nickname}</samp></p>
    						<p class="toContent">${item.parentComment.content}</p>
    					</div>`;
		}
		
		return `<div class="tNcomment-item">
    				<div class="userPicWrap">
    					<div class="userPic" style="background-image: url('${base.getLdAvatar(item.photo)}');"></div>
    				</div>
    				<div class="info">
    					<div class="userInfo">
    						<p class="nickName">${item.nickname}</p>
    						<samp class="updateTime">${base.formatDate(item.commentDatetime,"yyyy-MM-dd hh:mm:ss")}</samp>
    					</div>
    					${toComment}
    					<div class="content">${item.content}</div>
    				</div>
    			</div>`;
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
		
		//留言点击
        $("#goliuyan").click(function(){
        	location.href="../public/comment2.html?type=AN&code="+code;
        })
        //查看更多留言 点击
        $("#allTNotesComment").click(function(){
        	location.href="../public/comment2.html?type=AN&code="+code;
        })
	}
})
