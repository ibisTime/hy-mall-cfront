define([
    'app/controller/base',
    'swiper',
    'app/interface/GeneralCtr',
    'app/util/handlebarsHelpers',
], function(base, Swiper, GeneralCtr, Handlebars) {
	var code = base.getUrlParam("code");
    var _comTmpl = __inline('../../ui/comment-item.handlebars');
    var config = {
        start: 1,
        limit: 10,
        entityCode: code
    }, isEnd = false, canScrolling = false;
	
    init();

	function init(){
		base.showLoading();
        $.when(
        	getPageComment()
        )
        addListener();
	}
	
	function getPageComment(refresh){
		GeneralCtr.getPageComment(config, refresh).then((data)=>{
			base.hideLoading()
			var lists = data.page.list
			
			var totalCount = data.page.totalCount;
            if (totalCount <= config.limit || lists.length < config.limit) {
                isEnd = true;
            }
			if(lists.length){
				
				$('#content').append(_comTmpl({items: lists}))
				
                isEnd && $("#loadAll").removeClass("hidden");
                config.start++;
			}else if(config.start == 1){
				$('#content').html('<li class="no-data">暂无商品</li>')
			}else {
                $("#loadAll").removeClass("hidden");
            }
		},()=>{})
	}
	
	function addListener(){
		$(window).off("scroll").on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                base.showLoading();
                getPageComment();
            }
        });
	}
	
	
})
