define([
    'app/controller/base',
    'swiper',
    'app/module/weixin',
    'app/interface/GeneralCtr',
	'app/interface/UserCtr',
    'app/interface/ActivityStr',
    'app/module/bindMobile',
], function(base, Swiper, weixin, GeneralCtr, UserCtr, ActivityStr, BindMobile) {
	var code = base.getUrlParam("code");
	var isBtn = base.getUrlParam("isBtn"); //是否是一键报名进入页面
	var isUserInfo = false;//是否有用户信息(outName,realName,idNo,mobile)
	var amountType = 0;//收费类型 ： 0=免费， 1=收费
	var isBindMobile= false; //是否绑定手机号
	var actName = '';
	
    init();

	function init(){
		
		base.showLoading();
		$.when(
			getUserInfo(),
			getUserSysConfig(),
			getActivityDetail(),
			getActJoinIn(),
			getPageActComment()
		).then(()=>{
			if(isBtn==1){
				setTimeout(function(){
					var h = Math.max(document.body.scrollHeight,document.documentElement.scrollHeight); //文档内容实际高度 
					$(document).scrollTop(h);
				},100)
			}
		})
		addListener()
		
	}
	// 获取用户信息
	function getUserInfo() {
		return UserCtr.getUser().then(function(data) {
			if(data.outName&&data.mobile&&data.idNo&&data.realName){
				isUserInfo=true
			}else{
				isUserInfo = false
			}
			if(data.mobile){
				isBindMobile = true;
			}else{
				isBindMobile = false
			}
		});
	}
	
	//获取详情
	function getActivityDetail(){
		return ActivityStr.getActivityDetail(code).then((data)=>{
			
			amountType = data.amountType
			$("#leaderTelWrap").attr("href",'tel://'+data.user.mobile)
			$("#leaderTel").html(data.user.mobile+"("+data.user.outName+")")
			
			var dpic = data.pic;
	        var strs= []; //定义一数组 
			var html="";
			strs=dpic.split("||"); //字符分割
			
			if(strs.length>1){
				strs.forEach(function(d, i){
					html+=`<div class="swiper-slide"><div class="mallDetail-img" style="background-image: url('${base.getImg(d,'?imageMogr2/auto-orient/thumbnail/!1500x720')}')"></div></div>`;
				})
				$("#top-swiper").html(html);
				var mySwiper = new Swiper('#swiper-container', {
		            'paginationClickable' :true,
		            'preventClicksPropagation': true,
	                // 如果需要分页器
	                'pagination': '.swiper-pagination'
	            });
			}else{
				$("#top-swiper").html(`<div class="swiper-slide"><div class="mallDetail-img" style="background-image: url('${base.getImg(dpic,'?imageMogr2/auto-orient/thumbnail/!1500x720')}')"></div></div>`);
			}
			actName  = data.name;
			
			$('title').html(data.name+'-活动详情');
			//微信分享
	        weixin.initShare({
	            title: data.name+'-活动详情',
	            desc: data.slogan?data.slogan:data.name,
	            link: location.href,
	            imgUrl: base.getImg(data.advPic)
	        });
	        
			//收藏
			data.isCollect=='1'?$("#collect").addClass("active"):$("#collect").removeClass("active")
	        
	        $(".detail-title .name").html(data.name)
			$(".detail-title .slogan").html(data.slogan?data.slogan:'')
			$("#price").html('<i>￥</i>'+base.formatMoney(data.amount))
			$(".detail-title .enrollEndDatetime").text(base.formatDate(data.enrollEndDatetime, "yyyy-MM-dd"))
			$(".detail-title .data").text(base.formatDate(data.startDatetime, "yyyy-MM-dd")+"至"+base.formatDate(data.endDatetime, "yyyy-MM-dd"))
			$(".detail-title .userNum").text(data.groupNum)
			
			var placeAsseProvince = data.placeAsseProvince=='其他'?'':data.placeAsseProvince+" ";
			var placeAsseCity = data.placeAsseCity=='其他'?'':data.placeAsseCity+" ";
			var placeDestProvince = data.placeDestProvince=='其他'?'':data.placeDestProvince+" ";
			var placeDestCity = data.placeDestCity=='其他'?'':data.placeDestCity+" ";
			
			$(".detail-title .placeAsse").text(placeAsseProvince+placeAsseCity+data.placeAsse)
			$(".detail-title .placeDest").text(placeDestProvince+placeDestCity+data.placeDest)
			
			startActive($("#indexQd"),data.indexQd)
			startActive($("#indexNd"),data.indexNd)
			startActive($("#indexFj"),data.indexFj)
			
			$("#description").html(data.description)
			$("#amountDesc").html(data.amountDesc)
			$("#scheduling").html(data.scheduling)
			$("#equipment").html(data.equipment)
			$("#placeDesc").html(data.placeDesc)
			
			
			if(data.enrollNum!='0'){
				
				$("#enrollNum").html(data.enrollNum)
				$("#enrollNumWrap").removeClass('hidden')
			}
			
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
	
	//获取活动报名人数
	function getActJoinIn(){
		return ActivityStr.getActJoinIn(code).then(function(data){
			var html = ''
			data.length && data.forEach(function(d, i){
				if(i<=14){
					html+=`<div class="photo-item" style="background-image: url('${base.getAvatar(d.photo)}');"></div>`
				}else{
					return false;
				}
				
			})
			$("#photoList").html(html)
		});
	}
	
	//分页查询评论
	function getPageActComment(){
		return GeneralCtr.getPageActComment({
			start:1,
			limit:3,
			entityCode: code,
			parentCode: code
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
		
		if(item.childComment){
			toComment = `<div class="toComment">
    						<p class="toNickName">领队回复:${item.childComment.content}</p>
    					</div>`;
		}
		return `<div class="tNcomment-item actComment-item ">
    				<div class="userPicWrap">
    					<div class="userPic" style="background-image: url('${base.getAvatar(item.photo)}');"></div>
    				</div>
    				<div class="info">
    					<div class="userInfo">
    						<p class="nickName">${item.nickname}</p>
    						<samp class="updateTime">${base.formatDate(item.commentDatetime,"yyyy-MM-dd hh:mm:ss")}</samp>
    					</div>
    					<div class="content">${item.content}</div>
    					${toComment}
    				</div>
    			</div>`;
	}
	//提交订单
	function submitOrder(params){
		return ActivityStr.placeOrder(params).then((data)=>{
			base.hideLoading()
			base.showMsg("报名成功！")
			setTimeout(() => {
                location.replace("../user/user.html");
            }, 500);
		}, base.hideLoading)
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
				
				setTimeout(function(){
					base.showMsg("请先确认活动事项！")
				},100)
			}
		})
		
		//“我已确认并知晓上述活动事项” 点击
		$("#confirm").click(function(){
			$(this).toggleClass('active')
		})
		
		//“选择装备” 点击
		$("#chooseProductBtn").click(function(){
			location.href="../activity/submitOrder.html?type=2&code="+code
		})
		
		//“直接报名” 点击
		$("#subBtn").click(function(){
			//免费
			if(amountType==0){
				
				if(!isBindMobile){
					BindMobile.showMobileCont();
				}else{
					var params = {};
					params.applyNote = '用户直接报名';
					params.actCode = code;
					submitOrder(params)
				}
			}else{
				location.href="../activity/submitOrder.html?type=1&code="+code
			}
		})
		
		//留言点击
        $("#goliuyan").click(function(){
        	location.href="../public/comment2.html?type=AN&code="+code+"&name="+actName;
        })
        //查看更多留言 点击
        $("#allTNotesComment").click(function(){
        	location.href="../public/comment2.html?type=AN&code="+code+"&name="+actName;
        })
        
        //免责申明 查看更多 点击
        $("#act_mzsm_more").click(function(){
        	if($(this).hasClass("active")){
        		$(this).removeClass("active");
        		$(this).html("查看更多")
        		$(this).css("max-height","10rem")
        		$("#act_mzsm").css("max-height","10rem")
        	}else{
        		$("#act_mzsm").css("max-height","none")
        		$(this).addClass("active");
        		$(this).html("收起")
        	}
        })
        
        //报名须知 查看更多 点击
        $("#act_enroll_more").click(function(){
        	if($(this).hasClass("active")){
        		$(this).removeClass("active");
        		$(this).html("查看更多")
        		$(this).css("max-height","10rem")
        		$("#act_enroll").css("max-height","10rem")
        	}else{
        		$("#act_enroll").css("max-height","none")
        		$(this).addClass("active");
        		$(this).html("收起")
        	}
        })
        
        //地方介绍 查看更多 点击
        $("#placeDesc_more").click(function(){
        	if($(this).hasClass("active")){
        		$(this).removeClass("active");
        		$(this).html("查看更多")
        		$(this).css("max-height","10rem")
        		$("#act_enroll").css("max-height","10rem")
        	}else{
        		$("#act_enroll").css("max-height","none")
        		$(this).addClass("active");
        		$(this).html("收起")
        	}
        })
        
        //收藏
		$("#collect").click(function(){
			base.showLoading();
			if($(this).hasClass('active')){
				//取消收藏
				GeneralCtr.cancelCollecte(code,'AC').then(()=>{
					$(this).removeClass('active')
					base.hideLoading();
					base.showMsg('取消成功')
				},()=>{
					base.hideLoading();
				})		
			}else{
				
				//收藏
				GeneralCtr.addCollecte(code,'AC').then(()=>{
					$(this).addClass('active')
					base.hideLoading();
					base.showMsg('收藏成功')
				},()=>{
					base.hideLoading();
				})	
			}
		})
        
	}
})
