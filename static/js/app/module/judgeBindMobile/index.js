define([
  'jquery',
  'app/module/bindMobileSms',
  'app/util/dialog',
  'app/module/loadImg'
], function($, BindMobileSms, dialog, loadImg) {
  var tmpl = __inline("index.html");
  var css = __inline("index.css");
  var defaultOpt = {};
  var first = true;
  init();

  function init() {
    $("head").append('<style>' + css + '</style>');
  }

  function _showMsg(msg, time) {
    var d = dialog({
      content: msg,
      quickClose: true
    });
    d.show();
    setTimeout(function() {
      d.close().remove();
    }, time || 1500);
  }
  var JudgeBindMobile = {
    addCont: function(option) {
      option = option || {};
      defaultOpt = $.extend(defaultOpt, option);
      if (!this.hasCont()) {
        var temp = $(tmpl);
        $("body").append(tmpl);
      }
      var that = this;
      var html =
        '<div class="login-chose-avatar"><img src="/static/images/share.png" /></div>';
      $("#login-avatar-module").html(loadImg.loadImg(html));
      $("#login-nickname-module").html(defaultOpt.nickname);
      if (first) {
        BindMobileSms.addMobileCont({
          success: function(res, res1) {
            defaultOpt.success && defaultOpt.success(res, res1);
          },
          error: function(msg) {
            _showMsg(msg);
          },
          hideBack: 1
        });

        $("#login-chose-bindmobile").on("click", function() {
          BindMobileSms.showMobileCont();
        });
      }

      first = false;
      return this;
    },
    hasCont: function() {
      return !!$("#login-chose-module-container").length;
    },
    showCont: function() {
      if (this.hasCont()) {
        var wrap = $("#login-chose-module-container");
        wrap.css("top", $(window).scrollTop() + "px");
        wrap.show().animate({
          left: 0
        }, 200, function() {
          defaultOpt.showFun && defaultOpt.showFun();
        });
      }
      return this;
    },
    hideCont: function(func) {
      if (this.hasCont()) {
        var wrap = $("#login-chose-module-container");
        wrap.animate({
          left: "100%"
        }, 200, function() {
          wrap.hide();
          func && func();
        });
      }
      return this;
    }
  }
  return JudgeBindMobile;
});
