define([
    'app/controller/base',
    'app/module/foot',
    'app/module/scroll',
    'app/util/handlebarsHelpers',
    'app/interface/MallCtr',
    'app/interface/GeneralCtr',
], function(base, Foot, scroll, Handlebars, MallCtr, GeneralCtr) {
    var searchVal = base.getUrlParam('searchVal') || "";
    var status = base.getUrlParam('status') || "1";
    var config = {
        start: 1,
        limit: 10,
        productName: searchVal,
        status: status
    }, isEnd = false, canScrolling = false;
	var v = 6;
    var myScroll;

    init();
    
    function init(){
        Foot.addFoot();
        base.showLoading()
    	$("#search .searchText").val(searchVal)
    	$("#hotTitle .status"+status).addClass('active');
    	getPageGroupPurchaseProduct()
        
        addListener();
    }
	
	//分页获取租赁商品
	function getPageGroupPurchaseProduct(refresh){
    	MallCtr.getPageGroupPurchaseProduct(config, refresh)
            .then(function(data) {
                base.hideLoading();
                var lists = data.list;
                var totalCount = data.totalCount;//+lists.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                }
    			if(lists.length) {
    				var html= '';
	                lists.forEach((item,i) => {
	                    html += buildHtml(item,i);
	                });
                    $("#content").append(html);
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
    			} else if(config.start == 1) {
                    $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无"'+searchVal+'"相关商品</p></div>')
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                canScrolling = true;
        	}, base.hideLoading);
	}
	
	function buildHtml(item){
		return `<div class="mall-item bg_fff" >
					<a class="wp100" href="../mall/mallDetail.html?isGP=1&code=${item.productCode}&gCode=${item.code}">
						<div class="mall-item-img fl" style="background-image: url('${base.getImg(item.product.advPic)}');"></div>
						<div class="mall-item-con fr">
							<p class="name pr60">${item.product.name}</p>
							<samp class="grayTxt">${item.quantity}件成团</samp><br/>
							<samp class="grayTxt">${base.formatDate(item.startDatetime, 'yyyy-MM-dd')}至${base.formatDate(item.endDatetime, 'yyyy-MM-dd')}</samp>
							<div class="price">
								<samp class="samp1">￥${base.formatMoney(item.price)}</samp>
							</div>
						</div>
					</a>
				</div>`
	}
	
    function addListener(){
    	
		$(window).off("scroll").on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                base.showLoading();
                getPageLeaseProduct();
            }
        });
        
		$("#search .searchText").focus(function(){
    		$(document).keyup(function(event){
				if(event.keyCode==13){
					if($("#search .searchText").val()&&$("#search .searchText").val()!=''){
						base.gohrefReplace('../groupPurchase/groupPurchase-list.html?searchVal='+$("#search .searchText").val())
					}
				}
			}); 
    	})
    	$("#search .searchText").blur(function(){
			if (window.event.keyCode==13) window.event.keyCode=0 ;
    	})
		
		//标题点击
        $("#hotTitle .title").click(function(){
			base.gohrefReplace('../groupPurchase/groupPurchase-list.html?searchVal='+$("#search .searchText").val()+"&status="+$(this).attr("data-status"))
        })
		
    }
});
