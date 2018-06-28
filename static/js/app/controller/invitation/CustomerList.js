define([
    'app/controller/base',
    'app/util/dict',
    'app/interface/UserCtr'
], function(base, Dict, UserCtr) {
    var config = {
        start: 1,
        limit: 10
    }, isEnd = false, canScrolling = false;

    init();
    
    function init(){
    	base.showLoading();
    	getPageUser();
    	addListener();
    }
    
    //分页获取用户
	function getPageUser(refresh){
    	return UserCtr.getPageUser(config, refresh)
            .then(function(data) {
                base.hideLoading();
                var lists = data.list;
                var totalCount = data.totalCount;
                if(config.start == 1 && data.totalCount > 0){
                	$("#total").html(`共${data.totalCount}个会员`);
                } else if(config.start == 1 && data.totalCount > 0){
                	$("#total").html('');
                }
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                }
                if(data.list.length) {
	                var html = "";
	                lists.forEach((item,i) => {
	                    html += buildHtml(item,i);
	                });
                    $("#content").append(html);
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
    			} else if(config.start == 1) {
                    $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无会员</p></div>')
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                canScrolling = true;
        	}, base.hideLoading);
	}
	
	function buildHtml(item){
		var str = String(item.userId);
		return `<div class="customerList-item wp100 over-hide bg_fff">
				<div class="photo fl" style="background-image: url('${base.getWXAvatar(item.photo)}')"></div>
				<div class="content fr">
					<p class="nickName">${item.nickname}</p>
					<p class="txt over-hide">
						<samp class="fl">会员号：${str.substring(str.length-6, str.length)}</samp>
						<samp class="fr">加入日期：${base.formatDate(item.createDatetime, 'yyyy-MM-dd hh:mm:ss')}</samp>
					</p>
				</div>
			</div>`;
	}
	
    function addListener(){
        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                getPageUser();
            }
        });
    }
});
