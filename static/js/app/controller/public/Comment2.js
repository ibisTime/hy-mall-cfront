define([
    'app/controller/base',
	'app/module/validate',
    'app/interface/TravelNotesStr',
    'app/interface/GeneralCtr',
], function(base, Validate, TravelNotesStr, GeneralCtr) {
    var type = base.getUrlParam("type")||'';
    var actName = base.getUrlParam("name")||'';
    var code = base.getUrlParam("code");
    var config = {
        start: 1,
        limit: 10,
		entityCode: code
    }, isEnd = false, canScrolling = false;
    
    init();

	function init(){
        base.showLoading();
        if(type == "AN"){
        	config.parentCode = code;
        	$("#tNotesForm-comCon").attr("placeholder","发表留言...");
        	getPageActComment();
        }else{
        	$("#tNotesForm-comCon").attr("placeholder","发表回复...")
        	getPageTravelNotesComment();
        }
    	
        addListener();
	}
	
	//分页查询活动评论
	function getPageActComment(refresh){
		return GeneralCtr.getPageActComment(config,refresh).then((data)=>{
			var lists = data.list;
            var totalCount = +data.totalCount;
            if (totalCount <= config.limit || lists.length < config.limit) {
                isEnd = true;
            } else {
                isEnd = false;
            }
            if(data.list.length) {
                var html = "";
                lists.forEach((item) => {
                    html += buildHtmlAN(item);
                });
                $("#tNcommentList")[refresh || config.start == 1 ? "html" : "append"](html);
                isEnd && $("#loadAll").removeClass("hidden");
                config.start++;
                
            } else if(config.start == 1) {
                $("#tNcommentList").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无</p></div>');
                $("#loadAll").addClass("hidden");
            } else {
                $("#loadAll").removeClass("hidden");
            }
            !isEnd && $("#loadAll").addClass("hidden");
            canScrolling = true;
            
            base.hideLoading();
            
		}, base.hideLoading)
	}
	function buildHtmlAN(item,i){
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
	
	//分页查询游记评论
	function getPageTravelNotesComment(refresh){
		return TravelNotesStr.getPageTravelNotesComment(config,refresh).then((data)=>{
			var lists = data.list;
            var totalCount = +data.totalCount;
            if (totalCount <= config.limit || lists.length < config.limit) {
                isEnd = true;
            } else {
                isEnd = false;
            }
            if(data.list.length) {
                var html = "";
                lists.forEach((item) => {
                    html += buildHtml(item);
                });
                $("#tNcommentList")[refresh || config.start == 1 ? "html" : "append"](html);
                isEnd && $("#loadAll").removeClass("hidden");
                config.start++;
                
            } else if(config.start == 1) {
                $("#tNcommentList").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无</p></div>');
                $("#loadAll").addClass("hidden");
            } else {
                $("#loadAll").removeClass("hidden");
            }
            !isEnd && $("#loadAll").addClass("hidden");
            canScrolling = true;
            
            base.hideLoading();
            
		}, base.hideLoading)
	}
	function buildHtml(item,i){
		var toComment = "";
		var bottomWrap = "";
		
		if(item.parentComment){
			toComment = `<div class="toComment">
    						<p class="toNickName">回复@<samp>${item.parentComment.nickname}</samp></p>
    						<p class="toContent">${item.parentComment.content}</p>
    					</div>`;
		}
		
		if(type != "AN"){
			bottomWrap = `<div class="bottomWrap">
	    					<div class="reply" data-code="${item.code}"><i class="icon"></i><samp>回复</samp></div>
	    				</div>`;
		}
		
		return `<div class="tNcomment-item">
    				<div class="userPicWrap">
    					<div class="userPic" style="background-image: url('${type=="AN"?base.getLdAvatar(item.photo) :base.getAvatar(item.photo)}');"></div>
    				</div>
    				<div class="info">
    					<div class="userInfo">
    						<p class="nickName">${item.nickname}</p>
    						<samp class="updateTime">${base.formatDate(item.commentDatetime,"yyyy-MM-dd hh:mm:ss")}</samp>
    					</div>
    					${toComment}
    					<div class="content">${item.content}</div>
    					${bottomWrap}
    				</div>
    			</div>`;
	}
	
	//回复
	function reply(comCode){
		if(comCode){
        	$("#comBtn").attr("data-code",comCode)
			$("#tNotesForm-comCon").focus();
		}else{
        	$("#comBtn").attr("data-code",'')
		}
	}
	
	function addListener(){
		$(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                base.showLoading();
                getPageTravelNotesComment();
            }
        });
        
        //评论
        $("#comBtn").click(function(){
        	var comCode = $(this).attr("data-code");
        	
        	if($("#tNotesForm-comCon").val()&&$("#tNotesForm-comCon").val().replace(/[ ]/g,"")){
        		base.showLoading();
        		
        		if(type == "AN"){
        			GeneralCtr.comment({
			        	content:$("#tNotesForm-comCon").val(),
			        	parentCode: comCode?comCode:code,
			        	entityCode: code,
			        	type: type,
			        	entityName: actName
			        }).then(()=>{
			        	
        				$("#tNDetail-bottom").removeClass("focus").addClass("blur")
			        	$("#mask").addClass("hidden")
			    		$("#tNotesForm-comCon").val("")
			        	base.hideLoading();
			        	base.showMsg("留言成功");
			        	
			        	setTimeout(function(){
							location.reload(true)
			        	},800)
			        	
			        }, base.hideLoading)
        		}else{
        			TravelNotesStr.travelNotesComment({
			        	content:$("#tNotesForm-comCon").val(),
			        	parentCode: comCode?comCode:code,
			        	travelCode: code
			        }).then(()=>{
			        	
        				$("#tNDetail-bottom").removeClass("focus").addClass("blur")
			        	$("#mask").addClass("hidden")
			    		$("#tNotesForm-comCon").val("")
			        	base.hideLoading();
			        	base.showMsg("评论成功");
			        	
			        	setTimeout(function(){
							location.reload(true)
			        	},800)
			        	
			        }, base.hideLoading)
        		}
        	}else{
        		base.showMsg("请输入内容")
        	}
        }) 
        
        
        var touchFalg=false;
        //输入框获取焦点
        
        $("#tNDetail-bottom").on("click",function(){
        	$("#comDialog").removeClass("hidden");
        	$("#tNDetail-bottom").addClass("hidden");
        	$("#tNotesForm-comCon").focus();
        	
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
        	//回复时
        	if($("#comBtn").attr("data-code")){
        		$("#comBtn").attr("data-code",'')
        		$("#tNotesForm-comCon").val("")
        	}
        	
        	touchFalg = false
        	$('body').on('touchmove',function(e){
				if(touchFalg){
					e.preventDefault();
				}
			})
        })
        
        //回复点击
        $("#tNcommentList").on("click",".tNcomment-item .bottomWrap .reply",function(){
    		$("#tNDetail-bottom").click()
        	reply($(this).attr("data-code"));
        })
        
	}
})