define([
  'app/controller/base',
  'app/module/validate',
  'app/interface/UserCtr'
], function(base, Validate, UserCtr) {
	var tradePwd = 0;
	
  init();

  function init() {
    addListeners();
  }

  function addListeners() {
    var _formWrapper = $("#formWrapper");
    _formWrapper.validate({
      'rules': {
        "mobile": {
          required: true,
          mobile: true
        }
      },
      onkeyup: false
    });
    
    $("#subBtn").on("click", function() {
      if (_formWrapper.valid()) {
      	setUserReferee()
      }
    });
  }
	
	function setUserReferee() {
    base.showLoading("设置中...");
    UserCtr.setUserReferee($("#mobile").val())
      .then(function() {
        base.hideLoading();
        base.showMsg("设置成功！");
        setTimeout(function() {
          history.back();
        }, 500);
      });
  }
});
