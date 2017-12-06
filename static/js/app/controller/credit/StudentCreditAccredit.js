define([
    'app/controller/base',
  	'app/module/validate',
    'app/module/qiniu',
  	'app/interface/UserCtr',
	'app/interface/GeneralCtr',
], function(base, Validate, qiniu, UserCtr, GeneralCtr) {
	
	init();
	
	function init(){
		$.when(
			getUserSysConfig(),
			initUpload()
		)
    	addListener()
	}
	//学信规则
	function getUserSysConfig(){
		GeneralCtr.getUserSysConfig('xuexin_guide', true).then((data)=>{
			$(".student-dialog-content").html(data.cvalue)
		})
	}
	
	//七牛
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
					fileAdd: function(up, file){
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
				location.replace('./studentCredit.html');
			}, 800)
		}, base.hideLoading());
	}
	
	function addListener(){
        
        $(".styCredit-rules").click(function(){
        	$("#dialog").removeClass('hidden')
        })
        
        $("#dialog #close").click(function(){
        	$("#dialog").addClass('hidden')
        })
		
		$("#subBtn").click(function(){
			if($('#xuexinPic').attr('data-key')){
				uploadAvatar($('#xuexinPic').attr('data-key'))
			}else{
				base.showMsg('请上传图片')
			}
		})
  	}
});