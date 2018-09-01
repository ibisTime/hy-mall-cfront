define([
    'app/controller/base',
    'app/module/foot',
    'picker',
    'app/util/handlebarsHelpers',
    'app/interface/GeneralCtr',
    'app/interface/ActivityStr'
], function(base, Foot, Picker, Handlebars, GeneralCtr, ActivityStr) {
    var code = base.getUrlParam('code');
    
    init();

	function init(){
		base.showLoading();
		getActivitySignInList();
		
		addListener()
	}
	
	//分页查询活动
    function getActivitySignInList() {
        return ActivityStr.getActivitySignInList(code).then((data) => {
            var lists = data;
            if(lists.length) {
            	var html = '';
            	lists.forEach(item => {
        			html += buildHtml(item);
            	})
            	$("#content").html(html);
            }
            base.hideLoading()
        }, () => base.hideLoading());
    }
    
    function buildHtml(item){
    	if(item.identity == '1'){
    		return `<div class="userWrap">
					<div class="userPic" style="background-image: url('${base.getImg(item.userInfo.photo)}');"></div>
					<div class="userInfo">
						<p class="nickName">${item.userInfo.nickname}</p>
						<samp class="updateTime">${base.hideMobile(item.userInfo.mobile)}</samp>
					</div>
				</div>`
    	} else {
    		return `<div class="userWrap">
					<div class="userPic" style="background-image: url('${base.getImg(item.photo)}');"></div>
					<div class="userInfo">
						<p class="nickName">${item.realName}</p>
						<samp class="updateTime">${base.hideMobile(item.mobile)}</samp>
					</div>
				</div>`
    	}
    }
    
	function addListener(){
		
	}
	
})
