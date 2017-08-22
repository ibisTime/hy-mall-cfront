define([
    'app/controller/base',
    'app/interface/GeneralCtr'
], function(base, GeneralCtr) {
    var orderCode = base.getUrlParam("code");
    init();

    function init(){
        base.showLoading();
        getPageRatekey();
        addListener();
    }
    function getPageRatekey() {
        GeneralCtr.getPageRatekey({
            start: 1,
            limit: 100
        }).then((data) => {
            base.hideLoading();
            var html = "";
            data.list.forEach((item) => {
                html += `<div class="assessment-item" data-ckey="${item.ckey}">
                            <div class="am-flexbox">
                                <div class="assessment-title">${item.remark}</div>
                                <div class="assessment-content">
                                    <i class="hot-star"></i>
                                    <i class="hot-star"></i>
                                    <i class="hot-star"></i>
                                    <i class="hot-star"></i>
                                    <i class="hot-star"></i>
                                    <span class="text">非常好</span>
                                </div>
                            </div>
                        </div>`
            });
            $("#wrapper").html(html);
        });
    }
    function addListener(){
        $("#wrapper").on("click", ".hot-star", function() {
            var _me = $(this);
            if(!_me.hasClass("active")) {
                _me.addClass("active");
                _me.prevAll().addClass("active");
            } else {
                if(!_me.nextAll(".active").length) {
                    _me.removeClass("active");
                }
                _me.nextAll().removeClass("active");
            }
        });
        $("#applyBtn").click(function() {
            rating();
        });
    }
    // 评论
    function rating() {
        var content = $("#content").val();
        if(!content) {
            base.showMsg("评论内容不能为空");
        } else if(content.length > 255) {
            base.showMsg("评论内容不能超过255位");
        } else {
            base.showLoading("提交中...");
            var itemScoreList = [];
            $("#wrapper").find(".assessment-item")
                .each(function() {
                    var _item = $(this),
                        ckey = _item.attr("data-ckey"),
                        score = _item.find(".hot-star.active").length;
                    itemScoreList.push({
                        ckey,
                        score
                    });
                });
            content = base.encode(content);
            GeneralCtr.rating(orderCode, content, itemScoreList)
                .then((data) => {
                    base.hideLoading();
                    var time = 500;
                    if(/;filter/.test(data.code)){
                        base.showMsg("您的评论存在敏感词，我们将进行审核");
                        time = 1500;
                    } else {
                        base.showMsg("评论成功");
                    }

                    setTimeout(() => {
                        location.href = "../index.html";
                    }, time);
                });
        }

    }
});
