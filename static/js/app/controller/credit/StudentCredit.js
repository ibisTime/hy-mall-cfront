define([
    'app/controller/base',
    'app/util/dict',
  	'app/module/validate',
  	'app/interface/UserCtr',
], function(base, Dict, Validate, UserCtr) {
	var statusList= Dict.get("studentCreditStatus"),
		jmyjAmount = 0;
	
	init();
	
	function init(){
		base.showLoading()
		getUserJmAmount()
    	addListener()
	}
	
	function getStuCreditDetail(){
		UserCtr.getCreditDetail('student').then((data)=>{
			base.hideLoading();
			
			$("#xuexinPic").css("background-image", "url('"+base.getImg(data.authArg1)+"')");
			
			
			if(data.status=='1'){
				
				$(".status").html(statusList[data.status]+',可减免'+base.formatMoney(jmyjAmount)+'元')
			}else{
				$(".status").html(statusList[data.status])
			}
			if(data.status == '2'){
				$("#subBtn").removeClass('hidden')
			}
		})
	}
	
	function getUserJmAmount(){
		UserCtr.getUserJmAmount().then(function(data) {
    		jmyjAmount = data.studentDeductAmount
    		
    		getStuCreditDetail();
		});
	}
	function addListener(){
		$("#subBtn").click(function(){
			
				location.replace('./studentCredit.html');
		})
  	}

});