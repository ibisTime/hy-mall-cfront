define([
  'app/controller/base',
  'app/module/foot',
  'app/interface/UserCtr',
  'app/interface/AccountCtr'
], function(base, Foot, UserCtr, AccountCtr) {
  const SUFFIX =
    "?imageMogr2/auto-orient/thumbnail/!200x200r";
  init();

  function init() {
    // $("#logout").click(function() {
    //     base.clearSessionUser();
    //     location.reload(true);
    // });
    Foot.addFoot(3);
    base.showLoading("加载中...", 1);
    $.when(
      getUserInfo(),
      getAccount()
    ).then(base.hideLoading);
    getUnfinishedOrders();
  }
  // 获取未完成的订单数量
  function getUnfinishedOrders() {
    UserCtr.getUnfinishedOrders()
      .then((data) => {
        if (data.activityCount) {
          $("#activityWrap")
            .append(
              `<span class="am-badge am-badge-not-a-wrapper">
                            <sup class="am-badge-text">${data.activityCount}</sup>
                        </span>`
            );
        }
        if (data.orgCourseCount) {
          $("#courseWrap")
            .append(
              `<span class="am-badge am-badge-not-a-wrapper">
                            <sup class="am-badge-text">${data.orgCourseCount}</sup>
                        </span>`
            );
        }
        if (data.perCourseCount) {
          $("#coachWrap")
            .append(
              `<span class="am-badge am-badge-not-a-wrapper">
                            <sup class="am-badge-text">${data.perCourseCount}</sup>
                        </span>`
            );
        }
      });
  }
  // 获取账户信息
  function getAccount() {
    return AccountCtr.getAccount()
      .then(function(data) {
        data.forEach(function(d, i) {
          if (d.currency == "CNY") {
            $("#cnyAmount").text(base.formatMoney(
              d.amount));
          } else if (d.currency == "JF") {
            $("#jfAmount").text(base.formatMoney(
              d.amount));
          }
        })
      });
  }
  // 获取用户信息
  function getUserInfo() {
    return UserCtr.getUser().then(function(
      data) {
      $("#nickname").text(data.nickname);
      $("#userImg").attr("src", base.getAvatar(
        data.userExt.photo));
      $("#mobile").text(data.mobile);
    });
  }
});
