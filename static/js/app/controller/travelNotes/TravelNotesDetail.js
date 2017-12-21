define([
    'app/controller/base',
    'app/module/weixin',
	'app/module/validate',
    'app/interface/TravelNotesStr',
], function(base, weixin, Validate, TravelNotesStr) {
    var code = base.getUrlParam("code");
    
    init();

	function init(){
        
        base.showLoading();
        $.when(
        	getTravelNotesDetail(),
        	getPageTravelNotesComment()
        ).then(base.hideLoading())
        addListener();
	}
	
	//获取详情
	function getTravelNotesDetail(){
		return TravelNotesStr.getTravelNotesDetail(code).then((data)=>{
			var item = data;
			var picHtml='';
			if(item.pic){
				var strs =[],strs=item.pic.split('||');
	    		
	    		if(strs.length){
					strs.forEach(function(d, i){
						picHtml+=`<img src="${base.getImg(d)}" />`
					})
				}
	    		
			}
			
			if(data.status == '1'){
				$("#tNDetail-bottom").removeClass("hidden");
				$(".tNotes-comment").on("click",".goTNcommentList",function(){
		        	location.href="../public/comment2.html?code="+code;
		        })
			}
			
			$("#tNotesInfo .userPic").css({"background-image":"url('"+base.getImg(item.publishUser.photo)+"')"})
			$("#tNotesInfo .nickName").html(item.publishUser.nickname)
			$("#tNotesInfo .updateTime").html(base.formatDate(item.publishDatetime,"yyyy-MM-dd hh:mm:ss"))
			$("#tNotesInfo .description").html(item.description)
			$("#tNotesInfo .picWrap").html(picHtml)
			
			$("#tNotesInfo .bottomWrap .dsTimes samp").text(item.dsTimes)
			$("#tNotesInfo .bottomWrap .likeTimes samp").text(item.likeTimes)
			$(".tNDetail-bottom .commentTimes samp").text(item.commentTimes)
			$("#commentTimes").text(item.commentTimes)
			
			item.isLike=='1'?$("#tNotesInfo .bottomWrap .likeTimes").addClass("active"):''
			
		}, base.hideLoading)
	}
	
	//分页查询游记评论
	function getPageTravelNotesComment(){
		return TravelNotesStr.getPageTravelNotesComment({
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
                
            }
		}, base.hideLoading)
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
    					<div class="userPic" style="background-image: url('${base.getAvatar(item.photo)}');"></div>
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
		var _tNotesForm_ds = $("#tNotesForm-ds");
	    _tNotesForm_ds.validate({
	    	'rules': {
	        	"quantity": {
	        		number: true,
	        		required: true
	        	},
	    	},
	    	onkeyup: false
	    });
        
        //点赞
        $("#tNotesInfo").on("click", ".bottomWrap .likeTimes", function(){
        	var travelCode = code
        	
        	TravelNotesStr.likeTravelNotes(travelCode).then(()=>{
    			
        		if(!$(this).hasClass("active")){
        		
        			$(this).addClass("active")
        			$(this).children("samp").text(parseInt($(this).children("samp").text())+1)
        		}else{
        			$(this).removeClass("active")
        			$(this).children("samp").text(parseInt($(this).children("samp").text())-1)
        			
        		}
        		
        		base.hideLoading();
    			base.showMsg("操作成功")
    		}, base.hideLoading)
        })
        
        //打赏
        var touchFalg=false;
        var _dsItem;
        $("#tNotesInfo").on("click", ".bottomWrap .dsTimes", function(){
        	var travelCode = code
        	_dsItem=$(this)
        	$("#dsDialog #dsBtn").attr("data-code",travelCode);
        	$("#dsDialog").removeClass("hidden")
        	touchFalg = true;
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        })
        //打赏弹窗-取消
        $("#dsDialog").on("click", ".canlce", function(){
        	$("#dsDialog #dsBtn").attr("data-code",'');
        	$("#quantity").val("")
        	$("#dsDialog").addClass("hidden");
        	touchFalg = false
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        })
        //打赏弹窗-打赏
        $("#dsDialog").on("click", "#dsBtn", function(){
        	var travelCode = $(this).attr("data-code")
        	if(_tNotesForm_ds.valid()){
        		
        		base.showLoading();
        		TravelNotesStr.dsTravelNotes({
        			quantity:$("#quantity").val()*1000,
        			travelCode: travelCode
        		}).then(()=>{
        			_dsItem.children("samp").text(parseInt(_dsItem.children("samp").text())+1)
        			$("#dsDialog #canlce").click()
        			base.hideLoading();
        			base.showMsg("打赏成功")
        		}, base.hideLoading)
        		
        	}
        })
        //输入框获取焦点
        $("#tNDetail-bottom").on("click",function(){
        	$("#comDialog").removeClass("hidden");
        	$("#tNDetail-bottom").addClass("hidden");
        	$("#tNotesForm-comCon").focus()
        	
        	touchFalg = true;
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        })
         $("#comDialog").on("click", ".canlce", function(){
        	
        	$("#tNDetail-bottom").removeClass("hidden");
        	$("#comDialog").addClass("hidden");
        	touchFalg = false
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        })
        
        //评论
        $("#comBtn").click(function(){
        	if($("#tNotesForm-comCon").val()&&$("#tNotesForm-comCon").val().replace(/[ ]/g,"")){
        		base.showLoading();
        		
        		TravelNotesStr.travelNotesComment({
		        	content:$("#tNotesForm-comCon").val(),
		        	parentCode:code,
		        	travelCode: code
		        }).then(()=>{
		        	
		        	$("#mask").addClass("hidden")
        			$("#tNDetail-bottom").removeClass("focus").addClass("blur")
		    		$("#tNotesForm-comCon").val("")
		        	base.hideLoading();
		        	base.showMsg("评论成功");
		        	
		        	setTimeout(function(){
						location.reload(true)
		        	},800)
		        	
		        }, base.hideLoading)
        	}else{
        		base.showMsg("请输入内容")
        	}
        })
        
        
	}
})