define([
    'app/controller/base',
    'app/util/handlebarsHelpers',
  	'app/interface/UserCtr',
], function(base, Handlebars, UserCtr) {
	var type= base.getUrlParam('type');//类型(P 产品 RP租赁 N 资讯 AN 活动))
    var config = {
        start: 1,
        limit: 10,
    }, isEnd = false, canScrolling = false;
    
	var _NewTmpl = __inline('../../ui/information-list-item.handlebars');
	
	init();
	
	function init(){
    	
    	getInitData();
    	addListener();
	}
	
	function getInitData(refresh){
		if(type=='P'){
    		getPageMallCollect(refresh);
    	}else if(type=='RP'){
    		getPageLeaseCollect(refresh)
    	}else if(type=='N'){
    		getPageNewCollect(refresh);
    	}else if(type=='AN'){
    		getPageActivityCollect(refresh);
    	}
	}
	
	//商品
	function getPageMallCollect(refresh){
    	UserCtr.getPageMallCollect(config, refresh)
            .then(function(data) {
                base.hideLoading();
                var lists = data.list;
                var totalCount = data.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                }
    			if(lists.length) {
    				
                    var html = "";
                    lists.forEach((item) => {
                        html += buildHtmlMall(item);
                    });
                    $("#content")[refresh || config.start == 1 ? "html" : "append"](html);
                    
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
    			} else if(config.start == 1) {
                    $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无收藏</p></div>')
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                canScrolling = true;
        	}, base.hideLoading);
	}
	
	function buildHtmlMall(item){
		return ` <a class="mall-item" href="../mall/mallDetail.html?code=${item.product.code}">
				<div class="mall-item-img fl" style="background-image: url('${base.getImg(item.product.advPic,'?imageMogr2/auto-orient/thumbnail/!400x400')}');">
				</div>
				<div class="mall-item-con fr">
					<p class="name">${item.product.name}</p>
					<samp class="slogan">${item.product.slogan}</samp>
				</div>
			</a>`;	
	}
	
	//资讯
	function getPageNewCollect(refresh){
    	UserCtr.getPageNewCollect(config, refresh)
            .then(function(data) {
                base.hideLoading();
                var lists = data.list;
                var totalCount = data.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                }
    			if(lists.length) {
    				
                    var html = "";
                    lists.forEach((item) => {
                        html += buildHtmlNew(item);
                    });
                    $("#content")[refresh || config.start == 1 ? "html" : "append"](html);
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
    			} else if(config.start == 1) {
                    $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无收藏</p></div>')
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                canScrolling = true;
        	}, base.hideLoading);
	}
	
	function buildHtmlNew(item){
		return `<a href="../public/information-detail.html?code=${item.news.code}" class="info-item">
			        <div class="info-img" style="background-image: url('${base.getImg(item.news.advPic,'?imageMogr2/auto-orient/thumbnail/!690x300')}');"></div>
			        <div class="info-tit">${item.news.title}</div>
			    </a>`;	
	}

	//租赁
	function getPageLeaseCollect(refresh){
    	UserCtr.getPageLeaseCollect(config, refresh)
            .then(function(data) {
                base.hideLoading();
                var lists = data.list;
                var totalCount = data.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                }
    			if(lists.length) {
    				
                    var html = "";
                    lists.forEach((item) => {
                        html += buildHtmlLease(item.rproduct);
                    });
                    $("#content")[refresh || config.start == 1 ? "html" : "append"](html);
                    
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
    			} else if(config.start == 1) {
                    $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无收藏</p></div>')
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                canScrolling = true;
        	}, base.hideLoading);
	}
	
	function buildHtmlLease(item){
		return ` <a class="lease-item" href="../lease/lease-detail.html?code=${item.code}">
					<div class="pic" style="background-image: url('${base.getImg(item.advPic,'?imageMogr2/auto-orient/thumbnail/!1000x500')}');"></div>
					<div class="con">
						<p class="name">${item.name}</p>
						<samp class="slogan">${item.slogan}</samp>
					</div>
				</a>`;	
	}
	
	
	//活动
	function getPageActivityCollect(refresh){
    	UserCtr.getPageActivityCollect(config, refresh)
            .then(function(data) {
                base.hideLoading();
                var lists = data.list;
                var totalCount = data.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                }
    			if(lists.length) {
    				
                    var html = "";
                    lists.forEach((item) => {
                        html += buildHtmlActivity(item);
                    });
                    $("#content")[refresh || config.start == 1 ? "html" : "append"](html);
                    
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
    			} else if(config.start == 1) {
                    $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无收藏</p></div>')
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                canScrolling = true;
        	}, base.hideLoading);
	}
	
	function buildHtmlActivity(item){
		return ` <a class="mall-item" href="../mall/mallDetail.html?code=${item.activity.code}">
				<div class="mall-item-img fl" style="background-image: url('${base.getImg(item.activity.advPic,'?imageMogr2/auto-orient/thumbnail/!400x400')}');">
				</div>
				<div class="mall-item-con fr">
					<p class="name">${item.activity.name}</p>
					<samp class="slogan">${item.activity.slogan}</samp>
				</div>
			</a>`;	
	}
	
	function addListener(){
		$(window).off("scroll").on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                base.showLoading();
                getInitData();
            }
        });
        
		
  	}

});