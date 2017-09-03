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

    function getData() {
        base.showLoading();
        var userId = base.getUserId();
        var mydate = new Date();
        var nowDate = mydate.format("yyyy-MM-dd");
        $.when(
            UserCtr.getListDailyAttendance(),
            UserCtr.getSeriesDailyAttendance(nowDate)
        ).then(function(res1, res2) {
            base.hideLoading();
            for (i = 0; i < res1.data.length; i++) {
                var tempDate = base.formatDate(res1.data[i].signDatetime, "yyyy-MM-dd")

                if (nowDate == tempDate) {
                    $("#btn-signIn").val("明天再来").addClass("a-qiandao");
                }
            }

            $(".signInNum").html(res2.data);
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
            UserCtr.DailyAttendance.then(function(res) {
                base.hideLoading();
                var num = $(".signInNum").text();
                num = +num + 1;
                $(".signInNum").text(num);
                $("#btn-signIn").val("明天再来").addClass("a-qiandao");
            });
        });
    }

    function getAddr() {
        return sessionStorage.getItem("address") || "";
    }
});
