define([
    'app/controller/base',
    'app/interface/UserCtr'
], function(base, UserCtr) {
    var config = {
        start: 1,
        limit: 10
    }, isEnd = false, canScrolling = false;
    
    init();
    
    function init(){
    	base.showLoading();
    	getPageChildren()
    	addListener();
    }
    
    function getPageChildren(refresh){
    	return UserCtr.getPageChildren(config,refresh).then((data)=>{
                base.hideLoading();
                var lists = data.list;
                var totalCount = +data.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                } else {
                    isEnd = false;
                }
                if(data.list.length) {
                    var html = "";
                    lists.forEach((d, i) => {
                        html += `<div class="invitation-item">
                        	<div class="pic" style="background-image:url('${base.getImg(d.photo)}')"></div>
                        	<div class="con"><p>${d.nickname}</p><samp>加入时间: ${base.formatDate(d.createDatetime,'yyyy-MM-dd hh:mm:ss')}</samp></div></div>`;
                    });
                    $("#content")[refresh || config.start == 1 ? "html" : "append"](html);
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
                } else if(config.start == 1) {
                    $("#content").html('<div class="no-data">暂无推荐</div>');
                    $("#loadAll").addClass("hidden");
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                !isEnd && $("#loadAll").addClass("hidden");
                canScrolling = true;
    	},()=>{
    		base.hideLoading();
    	})
    }
    
    function addListener(){
    	
    }
});
