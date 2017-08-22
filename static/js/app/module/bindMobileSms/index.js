define([
  'jquery',
  'app/module/validate',
  'app/module/loading',
  'app/module/smsCaptcha',
  'app/interface/UserCtr'
], function($, Validate, loading, smsCaptcha, UserCtr) {
  var tmpl = __inline("index.html");
  var defaultOpt = {};
  var first = true;

  function bindMobile() {
    loading.createLoading("绑定中...");
    UserCtr.bindMobile($("#bind-mobileSms").val(), $("#bind-smsCaptcha").val())
      .then(function() {
        loading.hideLoading();
        BMobile.hideMobileCont(defaultOpt.success);
      }, function(error) {
        defaultOpt.error && defaultOpt.error(error || "手机号绑定失败");
      });
  }
  var BMobile = {
    addMobileCont: function(option) {
      option = option || {};
      defaultOpt = $.extend(defaultOpt, option);
      if (!this.hasMobileCont()) {
        var temp = $(tmpl);
        $("body").append(tmpl);
      }
      var wrap = $("#bindMobileSmsWrap");
      defaultOpt.title && wrap.find(".right-left-cont-title-name").text(defaultOpt.title);
      defaultOpt.mobile && $("#bind-mobileSms").val(defaultOpt.mobile);
      var that = this;
      if (first) {
        wrap.find(".right-left-cont-title")
          .on("touchmove", function(e) {
            e.preventDefault();
          });
        $("#bind-mobile-btnSms")
          .on("click", function() {
            if ($("#bind-mobile-formSms").valid()) {
              BMobile.hideMobileCont(defaultOpt.success);
            }
          });
        $("#bind-mobile-formSms").validate({
          'rules': {
            "bind-smsCaptcha": {
              sms: true,
              required: true
            },
            "bind-mobileSms": {
              required: true,
              mobile: true
            }
          },
          onkeyup: false
        });
        smsCaptcha.init({
          checkInfo: function() {
            return $("#bind-mobileSms").valid();
          },
          bizType: "805151",
          id: "bind-getVerification",
          mobile: "bind-mobileSms"
        });
      }

      first = false;
      return this;
    },
    hasMobileCont: function() {
      if (!$("#bindMobileSmsWrap").length)
        return false
      return true;
    },
    showMobileCont: function() {
      if (this.hasMobileCont()) {
        var wrap = $("#bindMobileSmsWrap");
        wrap.css("top", $(window).scrollTop() + "px");
        wrap.show().animate({
          left: 0
        }, 200, function() {
          defaultOpt.showFun && defaultOpt.showFun();
        });

      }
      return this;
    },
    hideMobileCont: function(func) {
      if (this.hasMobileCont()) {
        var wrap = $("#bindMobileSmsWrap");
        wrap.animate({
          left: "100%"
        }, 200, function() {
          wrap.hide();
          func && func($("#bind-mobileSms").val(), $("#bind-smsCaptcha").val());
          $("#bind-mobileSms").val("");
          $("#bind-smsCaptcha").val("");
          wrap.find("label.error").remove();
        });
      }
      return this;
    }
  }
  return BMobile;
});
