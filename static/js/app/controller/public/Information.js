define([
  'app/controller/base',
  'app/interface/GeneralCtr',
  'app/util/handlebarsHelpers'
], function(base, GeneralCtr, Handlebars) {
  var _tmpl = __inline('../../ui/information-list-item.handlebars');
  var config = {
      start: 1,
      limit: 15
    },
    isEnd = false,
    canScrolling = false;

  init();

  function init() {
    getPageInformation();
    addListener();
  }

	//分页获取资讯
  function getPageInformation(refresh) {
    base.showLoading();
    GeneralCtr.getPageInformation(config, refresh)
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
          $("#content").html('<li class="no-data">暂无资讯</li>')
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
        getPageInformation();
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
