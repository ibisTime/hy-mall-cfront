define([
    'app/controller/base',
    'app/util/ajax',
	'app/interface/UserCtr',
	'app/interface/GeneralCtr',
	'app/interface/AccountCtr',
    'app/module/signInDate',
], function(base, Ajax, UserCtr, GeneralCtr, AccountCtr, SignInDate) {
	var accountNumber;
	
    init();

    function init() {
		$.when(
			getData(),
			getPageSignIn(),
			getUserSysConfig(),
			getAccount()
		)
        addListener();
    }
	
	//签到信息
    function getData() {
        base.showLoading();
        var mydate = new Date();
        var nowDate = mydate.format("yyyy-MM-dd");
        UserCtr.getSeriesDailyAttendance(nowDate).then(function(data) {
            base.hideLoading();

            if (data.todaySign) {
                $("#btn-signIn").addClass("a-qiandao").find('.txt').html("已签到");
            }
            
            $(".signInNum").html(data.days);
        });
    }
    
    //分页获取签到记录
	function getPageSignIn(){
		UserCtr.getPageSignIn().then((data)=>{
			var nowDate = new Date();
			var nowMonth = nowDate.getMonth()+1;
	        var signList=[];
	        
			data.list.forEach(function(d, i){
				if(nowMonth==base.formatDate(d.signDatetime,'MM')){
					signList.push(base.formatDate(d.signDatetime,'dd'))
				}
			})
			
	   		calUtil.init(signList); 
		})
	}
	
	//用户账户
	function getAccount(){
		AccountCtr.getAccount()
	    	.then(function(data) {
	    	data.forEach(function(d, i) {
	        	if (d.currency == "JF") {
	            	accountNumber = d.accountNumber
	        	}
	        })
	    	
	    	getDailyAttendanceSta()
	    });
	}
	
	//签到统计
	function getDailyAttendanceSta(){
    	UserCtr.getDailyAttendanceSta(accountNumber).then((data)=>{
    		$("#jfTotalAmount").html(base.formatMoney(data.totalAmount))
		})
	}
	
	//签到规则
	function getUserSysConfig(){
		GeneralCtr.getUserSysConfig('sign_rule', true).then((data)=>{
			$(".signIn-dialog-content").html(data.cvalue)
		})
	}
	
	function getSignInNum(){
		var mydate = new Date();
        var nowDate = mydate.format("yyyy-MM-dd");
        UserCtr.getSeriesDailyAttendance(nowDate).then(function(data) {
            $(".signInNum").html(data.days);
        });
	}
	
    function addListener() {
    	//签到
        $("#btn-signIn").click(function() {
        	
        	if(!$(this).hasClass('a-qiandao')){
        		var addr = getAddr();
	            base.showLoading("签到中...");
	            
	            UserCtr.dailyAttendance(addr).then((data)=> {
	                base.hideLoading();
	                base.showMsg('签到成功',1000)
	                $("#btn-signIn").addClass("a-qiandao").find('.txt').html("签到成功");
	                base.showLoading()
					$.when(
						getPageSignIn(),
	                	getDailyAttendanceSta(),
	                	getSignInNum()
					).then(base.hideLoading(),base.hideLoading())
					
	            },()=>{});
        	}else{
        		base.showMsg('今日已签到，请明日再来哦')
        	}
        });
        
        $(".signRule").click(function(){
        	$("#dialog").removeClass('hidden')
        })
        
        $("#dialog #close").click(function(){
        	$("#dialog").addClass('hidden')
        })
    }

    function getAddr() {
        return sessionStorage.getItem("address") || "";
    }
});
