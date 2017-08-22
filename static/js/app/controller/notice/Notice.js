define([
    'app/controller/base',
    'app/module/weixin',
    'app/interface/GeneralCtr',
    'app/util/handlebarsHelpers'
], function(base, weixin, GeneralCtr, Handlebars) {
    var _tmpl = __inline('../../ui/notice-item.handlebars');
    var config = {
        start: 1,
        limit: 10
    }, isEnd = false, canScrolling = false;

    init();
    function init() {
		getPageNotice();
        addListener();
        weixin.initShare({
            title: document.title,
            desc: "自玩自健",
            link: location.href,
            imgUrl: base.getShareImg()
        });
    }
    //公告
    function getPageNotice(refresh) {
        base.showLoading();
    	GeneralCtr.getPageSysNotice(config, refresh)
            .then(function(data) {
                base.hideLoading();
                hideLoading();
                var lists = data.list;
                var totalCount = +data.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                }
    			if(data.list.length) {
                    $("#content").append(_tmpl({items: data.list}));
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
    			} else if(config.start == 1) {
                    $("#content").html('<li class="no-data">暂无公告</li>')
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                canScrolling = true;
        	}, hideLoading);
    }
    function addListener() {
        $(window).off("scroll").on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                showLoading();
                getPageNotice();
            }
        });
    }
    function showLoading() {
        $("#loadingWrap").removeClass("hidden");
    }

    function hideLoading() {
        $("#loadingWrap").addClass("hidden");
    }
});
