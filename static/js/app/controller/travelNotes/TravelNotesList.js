define([
    'app/controller/base',
    'app/module/foot',
	'app/module/validate',
    'app/interface/TravelNotesStr',
], function(base, Foot, Validate, TravelNotesStr) {
    var config = {
        start: 1,
        limit: 10
    }, isEnd = false, canScrolling = false;
	
    init();

	function init(){
        Foot.addFoot(0);
        getPageTravelNotes();
        addListener();
	}
	
	// 分页查询我的游记
    function getPageTravelNotes(refresh) {
        return TravelNotesStr.getPageTravelNotes(config, refresh)
            .then((data) => {
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
                    $("#content")[refresh || config.start == 1 ? "html" : "append"](html);
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
                    
                } else if(config.start == 1) {
                    $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无游记</p></div>');
                    $("#loadAll").addClass("hidden");
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                !isEnd && $("#loadAll").addClass("hidden");
                canScrolling = true;
                base.hideLoading();
                
            }, base.hideLoading);
    }
    //html
    function buildHtml(item) {
		var picHtml='';
		if(item.pic){
			var strs =[],strs=item.pic.split('||');
    		
    		if(strs.length>1){
				picHtml+=`<div class="picWraps">`;
				strs.forEach(function(d, i){
					if(i<3){
						picHtml+=`<div class="pic" style="background-image: url('${base.getImg(d)}');"></div>`
					}
				})
				picHtml+=`</div>`;
			}else{
				picHtml=`<div class="picWrap"><img src="${base.getImg(item.pic)}" /></div>`
			}
    		
		}
		var description = item.description;
		if(description.length>100){
			description = description.substring(0,100)+"...";
			description+='<samp class="all">全文</samp>'
		}
    	
        return `<div class="tNotes-item">
				<a class="wrap" href="../travelNotes/travelNotesDetail.html?code=${item.code}">
					<div class="userWrap">
						<div class="userPic" style="background-image: url('${base.getImg(item.publishUser.photo)}');"></div>
						<div class="userInfo">
							<p class="nickName">${item.publishUser.nickname}</p>
							<samp class="updateTime">${base.formatDate(item.publishDatetime,"yyyy-MM-dd hh:mm:ss")}</samp>
						</div>
					</div>
					<div class="conWrap">
						<div class="description">${description}</div>
						${picHtml}
					</div>
				</a>
				<div class="bottomWrap">
					<div class="btn dsTimes" data-code="${item.code}"><i class="icon"></i><samp>${item.dsTimes}</samp></div>
					<div class="btn commentTimes" data-code="${item.code}"><i class="icon"></i><samp>${item.commentTimes}</samp></div>
					<div class="btn likeTimes ${item.isLike=='1'?'active':''}" data-code="${item.code}"><i class="icon"></i><samp>${item.likeTimes}</samp></div>
				</div>
			</div>`;

    }
    
	function addListener(){
		$(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                base.showLoading();
                getPageTravelNotes();
            }
        });
        
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
        $("#content").on("click", ".tNotes-item .bottomWrap .likeTimes", function(){
        	var travelCode = $(this).attr("data-code")
        	
    		base.showLoading();
        		
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
        
        //评论
        $("#content").on("click", ".tNotes-item .bottomWrap .commentTimes", function(){
        	var travelCode = $(this).attr("data-code")
        	
        	location.href="../travelNotes/travelNotesDetail.html?code="+travelCode;
        })
        
        //打赏
        var touchFalg=false;
        var _dsItem;
        $("#content").on("click", ".tNotes-item .bottomWrap .dsTimes", function(){
        	var travelCode = $(this).attr("data-code")
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
        $("#dsDialog").on("click", "#canlce", function(){
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
        
        
	}
})
