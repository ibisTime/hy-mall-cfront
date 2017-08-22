define([
  'app/controller/base',
  'app/module/weixin',
  'app/interface/ActivityCtr',
  'app/util/handlebarsHelpers'
], function(base, weixin, ActivityCtr, Handlebars) {
  var _tmpl = __inline('../../ui/notice_activity.handlebars');
  var config = {
      start: 1,
      limit: 15
    },
    isEnd = false,
    canScrolling = false;

  init();

  function init() {
    getPageActivities();
    addListener();
    weixin.initShare({
      title: document.title,
      desc: "自玩自健",
      link: location.href,
      imgUrl: base.getShareImg()
    });
  }

  function getPageActivities(refresh) {
    base.showLoading();
    ActivityCtr.getPageActivities(config, refresh)
      .then(function(data) {
        base.hideLoading();
        hideLoading();
        var lists = data.list;
        var totalCount = +data.totalCount;
        if (totalCount <= config.limit || lists.length < config.limit) {
          isEnd = true;
        }
        if (data.list.length) {
          $("#content").append(_tmpl({
            items: data.list
          }));
          isEnd && $("#loadAll").removeClass("hidden");
        } else if (config.start == 1) {
          $("#content").html('<li class="no-data">暂无活动</li>')
        } else {
          $("#loadAll").removeClass("hidden");
        }
        canScrolling = true;
      }, hideLoading);
  }

  function addListener() {
    $(window).on("scroll", function() {
      if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(
          document).scrollTop())) {
        canScrolling = false;
        showLoading();
        getPageActivities();
      }
    });
  }

  function showLoading() {
    $("#loadingWrap").removeClass("hidden");
  }

  function hideLoading() {
    $("#loadingWrap").addClass("hidden");
  }
});
