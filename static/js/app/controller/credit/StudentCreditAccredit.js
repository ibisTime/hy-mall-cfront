define([
    'app/controller/base',
  	'app/module/validate',
    'app/module/qiniu',
  	'app/interface/UserCtr',
], function(base, Validate, qiniu, UserCtr) {
	
	init();
	
	function init(){
		initUpload();
    	addListener()
	}
	
	function initUpload(){
		qiniu.getQiniuToken()
			.then((data) =>{
				var token = data.uploadToken;
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
						$(".addxuexinPic").addClass('hidden')
						$("#xuexinPic").css("background-image", "url('"+url+"')");
						$('#xuexinPic').attr('data-key',key)
					}
				});
			}, () => {})
	}
	function uploadAvatar(photo){
		
    	base.showLoading("提交中...");
		UserCtr.getStuCreditImg(photo).then(function(data){
			base.hideLoading();
			base.showMsg('提交成功',1200);
			setTimeout(()=>{
//				location.replace('./studentCredit.html');
			}, 800)
		}, base.hideLoading());
	}
	
	function addListener(){
		$("#subBtn").click(function(){
			if($('#xuexinPic').attr('data-key')){
				uploadAvatar($('#xuexinPic').attr('data-key'))
			}else{
				base.showMsg('请上传图片')
			}
			
		})
  	}
});