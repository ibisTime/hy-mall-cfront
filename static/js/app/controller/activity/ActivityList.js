define([
    'app/controller/base',
    'app/util/handlebarsHelpers',
    'app/interface/GeneralCtr',
    'app/interface/ActivityStr'
], function(base, Handlebars, GeneralCtr, ActivityStr) {
	 var config = {
        start: 1,
        limit: 10,
        type:''
    }, isEnd = false, canScrolling = false;
    
    var _actTmpl = __inline('../../ui/activity-list-item.handlebars');
    
    init();

	function init(){
		base.showLoading();
		//获取类型数据字典
		GeneralCtr.getDictList({parentKey:'act_type'},'801907').then((data)=>{
			var html = ""
    		data.forEach(function(d, i){
    			html+=`<option value="${d.dkey}">${d.dvalue}</option>`
    		})
    		$("#type").append(html);
			getPageActivity();
		},base.hideLoading);
		addListener()
	}
	
	//分页查询活动
    function getPageActivity(refresh) {
    	config.type = $("#type").val();
        return ActivityStr.getPageActivity(config, refresh).then((data) => {
            var lists = data.list;
            var totalCount = +data.totalCount;
            if (totalCount <= config.limit || lists.length < config.limit) {
                isEnd = true;
            } else {
                isEnd = false;
            }
            if(data.list.length) {
                $("#content")[refresh || config.start == 1 ? "html" : "append"](_actTmpl({items: lists}));
                isEnd && $("#loadAll").removeClass("hidden");
                config.start++;
            } else if(config.start == 1) {
                $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂未发布活动</p></div>');
                $("#loadAll").addClass("hidden");
            } else {
                $("#loadAll").removeClass("hidden");
            }
            !isEnd && $("#loadAll").addClass("hidden");
            canScrolling = true;
            base.hideLoading()
        }, () => base.hideLoading());
    }
    
	function addListener(){
		
        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                getPageActivity();
            }
        });
		
		//返回顶部
        $("#goTop").click(()=>{
            var speed=200;//滑动的速度
            $('body,html').animate({ scrollTop: 0 }, speed);
            return false;
        })
        
        //类型
        $("#type").change(function(){
        	base.showLoading();
        	config.start =1;
        	getPageActivity(true)
        })
	}
})
