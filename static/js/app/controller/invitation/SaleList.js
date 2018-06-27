define([
    'app/controller/base',
    'app/util/dict',
    'app/interface/UserCtr'
], function(base, Dict, UserCtr) {
    var saleStatus = Dict.get("saleStatus");

    init();
    
    function init(){
    	base.showLoading();
		getPageSale();
    	addListener();
    }
	
	// 分页获取我的推客记录
	function getPageSale(){
		return UserCtr.getPageSale().then(function(data){
			base.hideLoading();
			var item = data.list[0];
			var html = `
			<div class="item">
				<p class="name">真实姓名：<samp>${item.realName}</samp></p>
			</div>
			<div class="item">
				<p class="mobile">手机号码：<samp>${item.mobile}</samp></p>
			</div>
			<div class="item">
				<p class="applyDatetime fl">状态：<samp>${saleStatus[item.status]}</samp></p>
				<p class="mobile fr">申请时间：<samp>${base.formatDate(item.applyDatetime, 'yyyy-MM-dd hh:mm:ss')}</samp></p>
			</div>
			<div class="item">
				<p class="remark ${item.status == '2' ? '' : 'hidden'}">审核说明：<samp>${item.remark}</samp></p>
			</div>`;
			$(".sale-wrap .sale-item").html(html);
			if(item.status == '2'){
				$('.sale-wrap .btn').removeClass("hidden");
			}
			
			$("#subBtn").click(function(){
				base.gohref(`../invitation/sale-apply.html?code=${item.code}`);
	    	})
		}, base.hideLoading)
	}
	
    function addListener(){
    }
});
