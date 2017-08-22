define([
    'app/controller/base',
    'app/module/weixin',
    'app/interface/ActivityCtr',
    'app/util/handlebarsHelpers',
    'app/util/dict',
    'swiper'
], function(base, weixin, ActivityCtr, Handlebars, Dict, Swiper) {
    var code = base.getUrlParam("code"),
        activityStatus = Dict.get("activityStatus"),
        status, remainNum;
    init();
    function init() {
        base.showLoading();
		getActivity();
        addListener();
    }
    // 查询活动详情
    function getActivity() {
        ActivityCtr.getActivity(code)
            .then((data) => {
                base.hideLoading();
                weixin.initShare({
                    title: document.title,
                    desc: data.slogan,
                    link: location.href,
                    imgUrl: base.getShareImg(data.advPic)
                });
                addBanner(data);
                $("#title").text(data.title);
                status = data.status;
                remainNum = data.remainNum;
                if(status == 1) {
                    $("#remainNum").text(remainNum);
                } else {
                    $("#remainNum").parent().html(activityStatus[status]);
                }
                $("#slogan").text(data.slogan);
                $("#contact")
                    .html(`<a href="tel://${data.contact}" class="course-tel am-flexbox-item">
                                <span>${data.contact}</span>
                            </a>
                            <i class="right-arrow"></i>`);
                $("#description").html(data.description);
                $("#datetime").text(base.formatDate(data.startDatetime, "yyyy-MM-dd hh:mm") + " ~ " +
                    base.formatDate(data.endDatetime, "yyyy-MM-dd hh:mm"));
                $("#amount").text(base.formatMoney(data.amount));
            });
    }
    function addBanner(data) {
        var html = "";
        var advPic = data.advPic.split("||");
        advPic.forEach(function(pic){
            html += `<div class="swiper-slide"><img class="wp100 hp100" src="${base.getImg(pic)}"></div>`;
        });
        if(advPic.length <= 1){
            $(".swiper-pagination").addClass("hidden");
        }
        $("#top-swiper").html(html);
        new Swiper('#swiper-container', {
            'direction': 'horizontal',
            'loop': advPic.length > 1,
            'autoplay': 4000,
            'autoplayDisableOnInteraction': false,
            // 如果需要分页器
            'pagination': '.swiper-pagination'
        });
    }
    function addListener() {
        $("#buyBtn").on("click", function() {
            if(status == 1) {
                if(remainNum) {
                    location.href = "./activity-confirm.html?code=" + code;
                } else {
                    base.showMsg("该活动报名人数已满");
                }
            } else {
                base.showMsg("该活动暂时无法报名");
            }
        });
    }
});
