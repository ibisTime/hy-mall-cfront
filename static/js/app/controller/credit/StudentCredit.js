define([
    'app/controller/base',
  	'app/module/validate',
  	'app/interface/UserCtr',
], function(base, Validate, UserCtr) {
	var statusList={
			'0':'审核中',
			'1':'审核通过，可免押租赁',
			'2':'审核未通过，请重新申请',
		}
	
	init();
	
	function init(){
		base.showLoading()
		getStuCreditDetail();
    	addListener()
	}
	
	function getStuCreditDetail(){
		UserCtr.getCreditDetail('student').then((data)=>{
			base.hideLoading();
			
			$("#xuexinPic").css("background-image", "url('"+base.getImg(data.authArg1)+"')");
			$(".status").html(statusList[data.status])
			
			if(data.status == '2'){
				$("#subBtn").removeClass('hidden')
			}
		})
	}

	function addListener(){
		$("#subBtn").click(function(){
			
				location.replace('./studentCredit.html');
		})
  	}

});