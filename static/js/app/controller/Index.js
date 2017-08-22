define([
    'app/controller/base',
    'app/module/foot',
    'app/module/weixin',
    'app/interface/GeneralCtr',
    'app/interface/CoachCtr',
    'app/interface/ActivityCtr',
    'app/interface/CourseCtr',
    'swiper',
    'app/util/handlebarsHelpers'
], function(base, Foot, weixin, GeneralCtr, CoachCtr, ActivityCtr, CourseCtr, Swiper, Handlebars) {
    var count = 2, coachList, labelList = {},
        genderList = {
            "0": "女",
            "1": "男"
        };
    const SUFFIX = "?imageMogr2/auto-orient/thumbnail/!200x200r";

    init();
    function init(){
        Foot.addFoot(0);
        base.showLoading();
    	$.when(
    		getBanner(),
    		getNotice(),
            getLabelList(),
            getPageCoach(),
            getPageCourse(),
            getPageActivities()
    	).then(base.hideLoading);
    	addListener();
        weixin.initShare({
            title: document.title,
            desc: "自玩自健",
            link: location.href,
            imgUrl: base.getShareImg()
        });
    }
    // 获取标签数据字典
    function getLabelList() {
        return GeneralCtr.getDictList("label_kind")
            .then((data) => {
                data.forEach((label) => {
                    labelList[label.dkey] = label.dvalue;
                });
                if(!--count) {
                    addLabelData();
                }
            });
    }
    // 当label的数据字典 和 coach 的数据都获取到了之后，再把值添加到页面中
    function addLabelData(list) {
        var html = "";
        coachList.forEach((coach) => {
            var star = +coach.star, remainStar = 5 - star,
                starHtml = "";
            while(star--) {
                starHtml += '<i class="hot-star active"></i>';
            }
            while(remainStar--) {
                starHtml += '<i class="hot-star"></i>';
            }
            var labels = coach.label.split("||"), labelHtml = "";
            labels.forEach((label, index) => {
                labelHtml += `<span class="hot-tip hot-tip${index % 3}">${labelList[label]}</span>`;
            });
            html += `<a href="./course/coach-detail.html?code=${coach.code}" class="hot-item hot-item-coach">
                        <div class="hot-adv">
                            <img class="wp100 hp100" src="${base.getImg(coach.pic, SUFFIX)}"/>
                        </div>
                        <div class="hot-item-cont">
                            <div class="hot-item-time">
                                <span class="hot-time">${coach.realName}</span>
                                <span class="hot-course-title">${genderList[coach.gender]}</span>
                            </div>
                            <div class="hot-stars">
                                ${starHtml}
                            </div>
                            <div class="hot-tips">
                                ${labelHtml}
                            </div>
                        </div>
                    </a>`;
        });
        $("#coachContent").html(html);
    }

    // 分页查询私教
    function getPageCoach(refresh) {
        return CoachCtr.getPageFilterCoach({
            start: 1,
            limit: 10,
            location: 1
        }, refresh).then((data) => {
            if(data.list.length) {
                coachList = data.list;
                if(!--count) {
                    addLabelData();
                }
            } else {
                $("#coachContent").html('<div class="no-data">暂无私教</div>');
            }
        })
    }
    // 分页查询课程
    function getPageCourse(refresh) {
        return CourseCtr.getPageCourse({
            start: 1,
            limit: 10,
            location: 1
        }, refresh).then((data) => {
            var _tmpl = __inline('../ui/index_course.handlebars');
            if(data.list.length) {
                $("#courseContent").html(_tmpl({items: data.list}));
            } else {
                $("#courseContent").html('<div class="no-data">暂无课程</div>');
            }
        });
    }
    // 分页查询活动
    function getPageActivities(refresh) {
        var _tmpl = __inline('../ui/index_activity.handlebars');
        return ActivityCtr.getPageActivities({
            start: 1,
            limit: 10,
            location: 1
        }, refresh).then((data) => {
            if(data.list.length) {
                $("#actContent").html(_tmpl({items: data.list}));
            } else {
                $("#actContent").html('<div class="no-data">暂无活动</div>');
            }
        });
    }

    //banner图
    function getBanner(){
        return GeneralCtr.getBanner()
            .then(function(data){
                if(data.length){
                    var html = "";
                    data.forEach(function(item){
                        html += `<div class="swiper-slide"><img data-url="${item.url}" class="wp100 hp100" src="${base.getImg(item.pic)}"></div>`;
                    });
                    if(data.length <= 1){
                        $(".swiper-pagination").addClass("hidden");
                    }
                    $("#top-swiper").html(html);
                    new Swiper('#swiper-container', {
                        'direction': 'horizontal',
                        'loop': data.length > 1,
                        'autoplay': 4000,
    		            'autoplayDisableOnInteraction': false,
                        // 如果需要分页器
                        'pagination': '.swiper-pagination'
                    });
                }
            });
    }

    //公告
    function getNotice(){
    	return GeneralCtr.getPageSysNotice({
            start: 1,
            limit: 1
        }).then(function(data){
			if(data.list.length){
				$("#noticeWrap").html(`
                    <a href="../notice/notice.html" class="am-flexbox am-flexbox-justify-between">
                        <div class="am-flexbox am-flexbox-item">
                            <img src="/static/images/notice.png" alt="">
                            <span class="am-flexbox-item t-3dot">${data.list[0].smsTitle}</span>
                        </div>
                        <i class="right-arrow"></i>
                    </a>`).removeClass("hidden");
			}
    	});
    }

    function addListener(){
        $("#swiper-container").on("touchstart", ".swiper-slide img", function (e) {
            var touches = e.originalEvent.targetTouches[0],
                me = $(this);
            me.data("x", touches.clientX);
        });
        $("#swiper-container").on("touchend", ".swiper-slide img", function (e) {
            var me = $(this),
                touches = e.originalEvent.changedTouches[0],
                ex = touches.clientX,
                xx = parseInt(me.data("x")) - ex;
            if(Math.abs(xx) < 6){
                var url = me.attr('data-url');
                if(url){
                	if(!/^http/i.test(url)){
                		location.href = "http://"+url;
                	}else{
                		location.href = url;
                	}
                }

            }
        });
    }
});
