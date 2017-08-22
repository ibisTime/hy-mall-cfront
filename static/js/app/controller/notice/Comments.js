define([
    'app/controller/base',
    'app/module/commentModal',
    'app/interface/CourseCtr',
    'app/interface/CoachCtr'
], function(base, commentModal, CourseCtr, CoachCtr) {
    const COACH = "coach", COURSE = "course";
    var type = base.getUrlParam("type") || COACH,
        code = base.getUrlParam("code");
    var config = {
        start: 1,
        limit: 20
    }, isEnd = false, canScrolling = false;
    var currentCtr;

    init();
    function init() {
        judgeType();
        addListener();
    }
    function judgeType(refresh) {
        if(type == COACH) {
            currentCtr = CoachCtr;
            getPageCoachComment(refresh);
        } else if(type == COURSE) {
            currentCtr = CourseCtr;
            getPageCourseComment(refresh);
        }
    }
    // 分页查询私教评论
    function getPageCoachComment(refresh) {
        base.showLoading();
    	CoachCtr.getPageComment({
            coachCode: code,
            ...config
        }, refresh).then(addContent, hideLoading);
    }
    // 分页查询私教评论
    function getPageCourseComment(refresh) {
        base.showLoading();
    	CourseCtr.getPageComment({
            productCode: code,
            ...config
        }, refresh).then(addContent, hideLoading);
    }
    function addContent(data) {
        base.hideLoading();
        hideLoading();
        var lists = data.list;
        var totalCount = +data.totalCount;
        if (totalCount <= config.limit || lists.length < config.limit) {
            isEnd = true;
        }
        if(data.list.length) {
            var html = "";
            data.list.forEach((item) => {
                html += buildComment(item);
            });
            $("#content").append(html);
            isEnd && $("#loadAll").removeClass("hidden");
            config.start++;
        } else if(config.start == 1) {
            $("#content").html('<li class="no-data">暂无评论</li>')
        } else {
            $("#loadAll").removeClass("hidden");
        }
        canScrolling = true;
    }
    // 生成评论的html
    function buildComment(item) {
        var star = Math.floor(+item.score), remainStar = 5 - star,
            starHtml = "";
        while(star--) {
            starHtml += '<i class="hot-star active"></i>';
        }
        while(remainStar--) {
            starHtml += '<i class="hot-star"></i>';
        }
        return `<div class="comment-item" data-code="${item.code}">
                    <div class="commer-info am-flexbox">
                        <div class="commer-avatar">
                            <img src="${base.getAvatar(item.photo)}"/>
                        </div>
                        <div class="commer-ext">
                            <h1>${item.commerRealName}</h1>
                            <div class="hot-stars">
                                ${starHtml}
                                <span>${base.formatDate(item.commentDatetime, "yyyy-MM-dd")}</span>
                            </div>
                        </div>
                    </div>
                    <div class="comment-cont">${item.content}</div>
                </div>`;
    }
    function addListener() {
        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                showLoading();
                judgeType();
            }
        });
        commentModal.addCont();
        $("#content").on("click", ".comment-item", function() {
            currentCtr.getComment($(this).attr("data-code"))
                .then((data) => {
                    commentModal.showCont(data);
                });
        });
    }
    function showLoading() {
        $("#loadingWrap").removeClass("hidden");
    }

    function hideLoading() {
        $("#loadingWrap").addClass("hidden");
    }
});
