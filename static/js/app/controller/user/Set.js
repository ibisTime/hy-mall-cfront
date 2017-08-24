define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/validate',
    'app/module/qiniu',
  	'app/interface/UserCtr',
], function(base, Ajax, Validate, qiniu, UserCtr) {
	var token, nickname, mobile, identityFlag;
	init();
	function init(){
		UserCtr.getUser()
			.then(function(data){
				$("#showAvatar").attr("src", base.getWXAvatar(data.photo));
				nickname = data.nickname;
				$("#nick").text(nickname);
				
				addListener();
				initUpload();
			}, function(){
				base.showMsg("用户信息获取失败");
			});
	}

	function addListener(){
		$("#nickWrap").on("click", function(){
			ChangeNickName.showNickCont();
		});
		$("#mobileWrap").on("click", function(){
			if(mobile)
				ChangeMobile.showMobileCont();
			else
				BindMobile.showMobileCont();
		});
        $("#identityWrap").on("click", function(){
			Identity.showIdentity();
		});
		// $("#changPwdWrap").on("click", function(){
		// 	ChangePwd.showCont();
		// });
  	}

	function initUpload(){
		qiniu.getQiniuToken()
			.then(function(data){
				token = data.uploadToken;
				qiniu.uploadInit({
					token: token,
					btnId: "uploadBtn",
					containerId: "uploadContainer",
					multi_selection: false,
					showUploadProgress: function(up, file){
						$(".upload-progress").css("width", parseInt(file.percent, 10) + "%");
					},
					fileAdd: function(file){
						$(".upload-progress-wrap").show();
					},
					fileUploaded: function(up, url, key){
						$(".upload-progress-wrap").hide().find(".upload-progress").css("width", 0);
						uploadAvatar(url, key);
					}
				});
			}, function(){
				base.showMsg("token获取失败");
			})
	}
	function uploadAvatar(url, photo){
		UserCtr.changePhoto(photo).then(function(res){
				$("#showAvatar").attr("src", url);
		}, function(){
		});
	}
});