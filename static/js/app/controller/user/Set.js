define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/validate',
    'app/module/qiniu',
  	'app/interface/UserCtr',
], function(base, Ajax, Validate, qiniu, UserCtr) {
	var token, nickname, mobile;
	
	init();
	function init(){
		
    	base.showLoading("加载中...", 1);
		UserCtr.getUser()
			.then(function(data){
				$("#showAvatar").css("background-image", "url('"+base.getWXAvatar(data.photo)+"')");
				$("#mobile").text(data.mobile)
				base.hideLoading();
				
				addListener();
				initUpload();
			}, function(){
				
				base.hideLoading();
				base.showMsg("用户信息获取失败");
			});
	}

	function addListener(){
  	}

	function initUpload(){
		qiniu.getQiniuToken()
			.then((data) =>{
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
						$("#showAvatar").css("background-image", "url('"+url+"')");
						uploadAvatar(url, key);
					}
				});
			}, () => {})
	}
	function uploadAvatar(url, photo){
		
    	base.showLoading("上传中...", 1);
		UserCtr.changePhoto(photo).then(function(res){
			base.hideLoading();
			base.showMsg('头像修改成功')
		}, base.hideLoading());
	}
});