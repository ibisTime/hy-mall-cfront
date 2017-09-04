define([
    'app/controller/base',
    'app/util/ajax',
	'app/interface/UserCtr',
], function(base, Ajax, UserCtr) {

    init();

    function init() {
        if (!base.isLogin())
            base.goLogin();
        else {
//          base.initLocation(initData, initData);
			initData()
        }
    }

    function initData() {
        getData();
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
                $("#btn-signIn").val("明天再来").addClass("a-qiandao");
            }
            
            $(".signInNum").html(data.days);
        });
    }

    function addListener() {
        $("#btn-signIn").click(function() {
            if (!base.isLogin()) {
                base.goLogin();
                return;
            }
            var addr = getAddr();
            base.showLoading("签到中...");
            
            UserCtr.dailyAttendance(addr).then((data)=> {
                base.hideLoading();
                var num = $(".signInNum").text();
                num = +num + 1;
                $(".signInNum").text(num);
                $("#btn-signIn").val("明天再来").addClass("a-qiandao");
            },()=>{});
        });
    }

    function getAddr() {
        return sessionStorage.getItem("address") || "";
    }
});
