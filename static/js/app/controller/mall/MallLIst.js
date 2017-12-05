define([
    'app/controller/base',
    'app/module/foot',
    'app/module/scroll',
    'app/util/handlebarsHelpers',
    'app/interface/MallCtr',
    'app/interface/GeneralCtr',
], function(base, Foot, scroll, Handlebars, MallCtr, GeneralCtr) {
    var _proTmpl = __inline('../../ui/mall-list-item.handlebars');
    var cate = base.getUrlParam("type") || '',
        myScroll, lType,
        start = 1,
        limit = 10,
        isEnd = false,
        canScrolling = false;
    var l_code, category;

    init();

    function init() {
        Foot.addFoot(1);
        addListener();
        base.showLoading();
        $.when(
        	getBigCategoryList(),
        	getPageCarProduct()
        )
    }
    // 获取商品大类
    function getBigCategoryList(){
        MallCtr.getBigCategoryList()
            .then(function(data) {
                var html = '<li l_type="" class="allCategory">全部分类</li>', html1 = '<li l_type="" class="wp33 tc fl allCategory">全部分类</li>';
                for (var i = 0; i < data.length; i++) {
                    var d = data[i];
                    html += `<li l_type="${d.code}">${d.name}</li>`;
                    html1 += `<li l_type="${d.code}" class="wp33 tc fl">${d.name}</li>`;
                }
                var scroller = $("#scroller");
                scroller.find("ul").html(html);
                $("#allItem").find("ul").html(html1);
                addCategory();
                cate = cate || '';
                scroller.find("ul>li[l_type='" + cate + "']").click();
                if(!cate){
                	//下拉加载
		            $(window).off("scroll").on("scroll", function() {
		                if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
		                    canScrolling = false;
		                    base.showLoading();
		                    getPageProduct(l_code, category);
		                }
		            });
                }
            });
    }
    // 添加大类
    function addCategory() {
        var scroller = $("#scroller");
        var lis = scroller.find("ul li");
        for (var i = 0, width = 0; i < lis.length; i++) {
            width += $(lis[i]).outerWidth(true)+0.5;
        }
        $("#scroller").css("width", width);
        myScroll = scroll.getInstance().getScrollByParam({
            id: 'mallWrapper',
            param: {
                scrollX: true,
                scrollY: false,
                eventPassthrough: true,
                snap: true,
                hideScrollbar: true,
                hScrollbar: false,
                vScrollbar: false
            }
        });
    }
    //根据大类查询小类
    function getProduces(c,flag) {
        $("#mlTable ul").empty();
        MallCtr.getSmallCategoryList(c).then(function(data) {
            base.hideLoading();
            if(data.length){
            	$("#mlTable").show()
            }else{
            	$("#mlTable").hide()
            }
            $.each(data, function(i, val) {
                var name = val.name;
                var vcode = val.code;
                var html1 = "<li l_code=" + vcode + " class='wp20 tc'>" + name + "</li>";
                html1 = $(html1);
                html1.on("click", function() {
                    start = 1;
                    isEnd = false;
                    base.showLoading();
                    $("#content").empty();
                    l_code = $(this).attr("l_code");
                    $(this).addClass("active").siblings().removeClass("active");
                    getPageProduct(l_code, c).then(base.hideLoading);
                });
                //清空小类后再添加，否则会直接添加进去，原来的依旧在
                $("#mlTable ul").append(html1);
            });
            if(flag){
            	$("#mlTableHeight").css({"height":$(".mall_list_top").height()+$(".mall_list_table").height()})
            }
            //默认选中第一个
            var smallEle = $("#mlTable ul li:eq(0)");
                category = c, l_code = smallEle.attr("l_code");
            if (l_code) {
                smallEle.click();
            }else{
                base.showLoading();
                $("#content").empty();
                getPageProduct("", c).then(base.hideLoading);
            }
            //下拉加载
            $(window).off("scroll").on("scroll", function() {
                if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                    canScrolling = false;
                    base.showLoading();
                    getPageProduct(l_code, category);
                }
            });
        }, base.hideLoading);
    }
    
    //获取购物车商品
    function getPageCarProduct(){
		MallCtr.getPageCarProduct({
	        start: 1,
	        limit: 1,
		}).then((data)=>{
			
			if(data.list.length){
				$(".mallfloatWrap .shoppingCar").addClass('active')
			}
		})
	}
    
    // 分页查询商品
    function getPageProduct(l_c, c) {
        return MallCtr.getPageProduct({
            start,
            limit,
            category: c,
            type: l_c,
	        orderColumn: 'order_no',
	        orderDir: 'asc'
        }).then(function(data) {
            var lists = data.list;
            var totalCount = +data.totalCount;
            if (totalCount <= limit || lists.length < limit) {
                isEnd = true;
            }
            var html = "";
            if(lists.length){
                $("#content")[start == 1 ? "html" : "append"](_proTmpl({items: lists}));
                isEnd && $("#loadAll").removeClass("hidden");
                start++;
			} else if(start == 1) {
                $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无相关商品</p></div>').removeClass('bg_fff')
            } else {
                $("#loadAll").removeClass("hidden");
            }
            canScrolling = true;
        }).always(base.hideLoading)
    }
	
	
	function addListener(){
	        
		//返回顶部
        $("#goTop").click(()=>{
            var speed=200;//滑动的速度
            $('body,html').animate({ scrollTop: 0 }, speed);
            return false;
        })
        
		/**大类start */
        $("#down").on("click", function() {
            var me = $(this);
            if (me.hasClass("down-arrow")) {
                $("#allCont").removeClass("hidden");
                me.removeClass("down-arrow").addClass("up-arrow");
            } else {
                $("#allCont").addClass("hidden");
                me.removeClass("up-arrow").addClass("down-arrow");
            }
        });
        $("#mall-mask").on("click", function() {
            $("#down").click();
        });
        $("#allItem").on("click", "li", function() {
            var lType = $(this).attr("l_type");
            $("#scroller").find("li[l_type='" + lType + "']").click();
            $("#down").click();
        });
        $("#scroller").on("click", "li", function() {
            var me = $(this);
            $("#mallWrapper").find(".current").removeClass("current");
            me.addClass("current");
            myScroll.myScroll.scrollToElement(this);
            lType = me.attr("l_type");
            start = 1;
            isEnd = false;
            base.showLoading();
            $("#loadAll").addClass("hidden");
            if(me.hasClass('allCategory')){
            	l_code = '';
            	category = '';
            	$("#mlTable").addClass('hidden')
                getPageProduct(l_code, category);
            	$("#mlTableHeight").css({"height":$(".mall_list_top").height()})
            }else{
            	$("#mlTable").removeClass('hidden')
            	getProduces(lType,1);
            }
            var allItem = $("#allItem");
            allItem.find("li.current").removeClass("current");
            allItem.find("li[l_type='" + lType + "']").addClass("current");
        });
        /**大类end */
		
		//收藏
		$("#content").on('click', '.mall-item .collect',function(){
			
			base.showLoading();
			if($(this).hasClass('active')){
				//取消收藏
				GeneralCtr.cancelCollecte($(this).attr('data-code'),'P').then(()=>{
					$(this).removeClass('active')
					base.hideLoading();
					base.showMsg('取消成功')
				},()=>{
					base.hideLoading();
				})		
			}else{
				
				//收藏
				GeneralCtr.addCollecte($(this).attr('data-code'),'P').then(()=>{
					$(this).addClass('active')
					base.hideLoading();
					base.showMsg('收藏成功')
				},()=>{
					base.hideLoading();
				})	
			}
		})
		
	}
	
})
