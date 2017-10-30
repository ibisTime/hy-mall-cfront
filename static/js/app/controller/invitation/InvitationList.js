define([
    'app/controller/base',
    'app/interface/UserCtr'
], function(base, UserCtr) {
    var config = {
        start: 1,
        limit: 10
    }, isEnd = false, canScrolling = false;
    var refeereLevelData = {
            "-1": ['上级推荐人'],
            "1": ['一级推荐人'],
            "2": ['二级推荐人']
        };
    
    
    init();
    
    function init(){
    	base.showLoading();
    	getPageChildrenLevel()
    	addListener();
    }
    
    //查询一级和二级推荐人接口
    function getPageChildrenLevel(refresh){
    	return UserCtr.getPageChildrenLevel(refresh).then((data)=>{
                base.hideLoading();
                if(data.length) {
                    var html = "";
                    var flag = false;
                    data.forEach((d, i) => {
                    	
                    	if(d.refeereLevel == '1' || d.refeereLevel == '2' ){
                    		html += `<div class="invitation-item">
                        	<div class="pic" style="background-image:url('${base.getImg(d.photo)}')"></div>
                        	<div class="con"><p>${d.nickname}(${refeereLevelData[d.refeereLevel]})</p><samp>加入时间: ${base.formatDate(d.createDatetime,'yyyy-MM-dd hh:mm:ss')}</samp></div></div>`;
                    
                    	}else{
                    		flag = true
                    	}
                    });
                    
                    $("#content").append(html);
                    if(data.length==1 && flag){
                    	
                    	$("#content").append('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无推荐</p></div>');
                    }
                } else{
                    $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无推荐</p></div>');
                    $("#loadAll").addClass("hidden");
                }
    	},()=>{
    		base.hideLoading();
    	})
    }
    
    //分页查询获客
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
                    	var THtml = '';
                    	
                        html += `<div class="invitation-item">
                        	<div class="pic" style="background-image:url('${base.getImg(d.photo)}')"></div>
                        	<div class="con"><p>${d.nickname}</p><samp>加入时间: ${base.formatDate(d.createDatetime,'yyyy-MM-dd hh:mm:ss')}</samp></div></div>`;
                    });
                    $("#content")[refresh || config.start == 1 ? "html" : "append"](html);
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
                } else if(config.start == 1) {
                    $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无推荐</p></div>');
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
