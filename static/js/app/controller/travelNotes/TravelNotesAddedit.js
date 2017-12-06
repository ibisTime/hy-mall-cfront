define([
    'app/controller/base',
	'app/module/validate',
    'app/module/qiniu',
    'app/interface/TravelNotesStr',
], function(base, Validate, qiniu, TravelNotesStr) {
    var code = base.getUrlParam("code") || '';
	
    init();

	function init(){
		
		if(code){
			base.showLoading();
			getTravelNotesDetail();
		}
		initUpload();
        addListener();
	}
	
	//获取游记详情
	function getTravelNotesDetail(){
		return TravelNotesStr.getTravelNotesDetail(code).then((data)=>{
			var item = data;
			var picHtml='';
			if(item.pic){
				var strs =[],strs=item.pic.split('||');
	    		
	    		if(strs.length){
					strs.forEach(function(d, i){
						picHtml += `<div class="pic" style="background-image: url('${base.getImg(d)}');" 
									data-url="${d}"><i class="delete"></i></div>`
					})
				}
	    		
			}
			$("#description").val(item.description)
			$("#uploadContainer").before(picHtml)
			base.hideLoading();
		}, base.hideLoading)
	}
	
	//发布游记
	function addTravelNotes(params){
		TravelNotesStr.addTravelNotes(params).then(()=>{
			base.hideLoading();
			base.showMsg("发布成功");
			setTimeout(function(){
				location.href = "../travelNotes/myTravelNotes.html"
			},800)
		},()=>{})
	}
	
	//编辑游记
	function editTravelNotes(params){
		TravelNotesStr.editTravelNotes(params).then(()=>{
			base.hideLoading();
			base.showMsg("修改成功");
			setTimeout(function(){
				location.href = "../travelNotes/myTravelNotes.html"
			},800)
		},()=>{})
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
					multi_selection: true,
					showUploadProgress: function(up, file){
						$(".upload-progress").css("width", parseInt(file.percent, 10) + "%");
					},
					fileAdd: function(up, file){
						$(".upload-progress-wrap").show();
					},
					fileUploaded: function(up, url, key){
						$(".upload-progress-wrap").hide().find(".upload-progress").css("width", 0);
						
						var picHtml = `<div class="pic" style="background-image: url('${url}');" 
									data-url="${key}"><i class="delete"></i></div>`
						$("#uploadContainer").before(picHtml)
					}
				});
			}, () => {})
	}
	
	function addListener(){
		var _tNotesForm = $("#tNotesForm");
	    _tNotesForm.validate({
	    	'rules': {
	        	"description": {
	        		required: true
	        	},
	    	},
	    	onkeyup: false
	    });
	    
	    //发布
	    $("#subBtn").click(function(){
	    	if (_tNotesForm.valid()) {
	    		var pic='';
	    		
      			$("#picWrap").find('.pic').each(function(i, d){
      				pic+=$(this).attr("data-url")
      				
      				if(i<$("#picWrap").find('.pic').length-1){
      					pic+='||';
      				}
      			})
      			
				base.showLoading();
	    		if(code){
	    			var params={
		    			description:$("#description").val(),
		    			pic:pic,
		    			code: code
		    		}
	    			editTravelNotes(params)
	    		}else{
	    			
	    			var params={
		    			description:$("#description").val(),
		    			pic:pic
		    		}
	    			addTravelNotes(params)
	    		}
	    		
		    }
	    })
	    
	    //删除
	    $("#picWrap").on("click",".pic .delete", function(){
	    	$(this).parent('.pic').remove();
	    })
	}
})
