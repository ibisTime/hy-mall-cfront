define([
    'app/controller/base',
    'app/util/ajax',
	'app/interface/UserCtr',
    'app/module/signInDate',
], function(base, Ajax, UserCtr, SignInDate) {

    init();

    function init() {
		$.when(
			getData(),
			getPageSignIn()
		)
        addListener();
    }
	
	//签到信息
    function getData() {
        base.showLoading();
        var userId = base.getUserId();
        var mydate = new Date();
        var nowDate = mydate.format("yyyy-MM-dd");
        UserCtr.getSeriesDailyAttendance(nowDate).then(function(data) {
            base.hideLoading();

            if (data.todaySign) {
                $("#btn-signIn").addClass("a-qiandao").find('p').html("明天再来");
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
	
    function addListener() {
    	//签到
        $("#btn-signIn").click(function() {
            var addr = getAddr();
            base.showLoading("签到中...");
            
            UserCtr.dailyAttendance(addr).then((data)=> {
                base.hideLoading();
                base.showMsg('签到成功',1200)
                
                setTimeout(function(){
                	location.reload(true)
                },800)
            },()=>{});
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
