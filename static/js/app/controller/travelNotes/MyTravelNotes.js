define([
    'app/controller/base',
    'app/interface/GeneralCtr',
    'app/interface/TravelNotesStr',
], function(base, GeneralCtr, TravelNotesStr) {
    var config = {
        start: 1,
        limit: 10
    }, isEnd = false, canScrolling = false;
	
    init();

	function init(){
		base.showLoading()
		getPageMyTravelNotes();		
        addListener();
	}
	
	// 分页查询我的游记
    function getPageMyTravelNotes(refresh) {
    	base.showLoading()
        return TravelNotesStr.getPageMyTravelNotes(config, refresh)
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
		
		var bottomWrap = "";
		//审核通过不可修改和删除
		if(item.status!='1'){
			if(item.status=='2'){
				bottomWrap+=`<div class="becauseWrap b_e_t">备注:${item.remark}</div>`
			}
			bottomWrap += `<div class="bottomWrap"><div class="btn delete fr_i" data-code="${item.code}"><i class="icon"></i><samp>删除</samp></div></div>`;
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
				${bottomWrap}
				</div>`;

    }
	
	
	function addListener(){
		$(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                base.showLoading();
                getPageMyTravelNotes();
            }
        });
        
        //删除
        $("#content").on("click", ".tNotes-item .bottomWrap .delete", function() {
            var code = $(this).attr("data-code");
            base.confirm('确认删除游记吗？')
                .then(() => {
                    base.showLoading("删除中...");
                    TravelNotesStr.deleteMyTravelNotes(code)
                        .then(() => {
                        	base.hideLoading();
                            base.showMsg("操作成功");
                            
                            setTimeout(function(){
					        	config.start = 1
	                			getPageMyTravelNotes(true);
                            },500)
                        }, base.hideLoading);
                }, () => {});
        });
        //编辑
        $("#content").on("click", ".tNotes-item .bottomWrap .edit", function() {
            var code = $(this).attr("data-code");
        	location.href="../travelNotes/travelNotes-addedit.html?code="+code;
        });
        
		
		//返回顶部
        $("#goTop").click(()=>{
            var speed=200;//滑动的速度
            $('body,html').animate({ scrollTop: 0 }, speed);
            return false;
        })
	}
})
