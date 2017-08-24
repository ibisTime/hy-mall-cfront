define([
    'app/controller/base',
    'app/util/ajax',
], function(base, Ajax) {
    $(function() {
        var returnUrl;
        addListeners();
        init();

        function init() {
            returnUrl = base.getUrlParam("return");
            if (returnUrl) {
                $("#toRegister").attr("href", './register.html?return=' + encodeURIComponent(returnUrl));
                $("#fdPwd").attr("href", './findPwd.html?return=' + encodeURIComponent(returnUrl));
            } else {
                $("#toRegister").attr("href", './register.html');
                $("#fdPwd").attr("href", './findPwd.html');
            }
        }

        function addListeners() {
            $("#loginBtn").on('click', loginAction);
            $("#mobile").on("change", function(e) {
                validate_username();
            });
            $("#password").on("change", function() {
                validate_password();
            });
        }

        function validate_username() {
            var username = $("#mobile")[0],
                parent = username.parentNode,
                span;
            if (username.value == "") {
                span = $(parent).find("span.warning")[0];
                $(span).fadeIn(150).fadeOut(3000);
                return false;
            } else if (!/^1[3,4,5,7,8]\d{9}$/.test(username.value)) {
                span = $(parent).find("span.warning")[1];
                $(span).fadeIn(150).fadeOut(3000);
                return false;
            }
            return true;
        }

        function validate_password() {
            var password = $("#password")[0],
                parent = password.parentNode,
                span;
            if (password.value == "") {
                span = $(parent).find("span.warning")[0];
                $(span).fadeIn(150).fadeOut(3000);
                return false;
            }
            return true;
        }

        function validate() {
            if (validate_username() && validate_password()) {
                return true;
            }
            return false;
        }

        function loginAction() {
            if (validate()) {
                // $("#loginBtn").attr("disabled", "disabled").val("登录中...");
                var param = {
                    "loginName": $("#mobile").val(),
                    "loginPwd": $("#password").val(),
                    "kind": "C"
                }, url = '805050';
                $.when(
                	Ajax.post(url, param),
                	Ajax.get('805917',{ckey:'qiniu_domain'},true)
                ).then(function(response,res) {
                            
	        				base.setSessionQiniuUrl('http://'+res.cvalue+'/');
        					base.setSessionUser(response);
                    });
            }
        }

        function goBack() {
            if (returnUrl) {
                location.href = returnUrl;
            } else {
                location.href = "./user_info.html";
            }
        }
    });
});
