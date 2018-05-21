define([
    'app/controller/base',
	'app/module/validate',
    'app/module/qiniu',
    'app/interface/TravelNotesStr',
    'app/interface/UserCtr',
    'app/module/bindMobile',
], function(base, Validate, qiniu, TravelNotesStr, UserCtr, BindMobile) {
    var code = base.getUrlParam("code") || '';
	var isBindMobile = false;//是否绑定手机号

    init();

	function init(){

		if(code){
			base.showLoading();

        	$.when(
	        	getUserInfo(),
	        	getTravelNotesDetail()
	        ).then(base.hideLoading,base.hideLoading)
		}else{
			$.when(
	        	getUserInfo()
	        ).then(base.hideLoading,base.hideLoading)
		}
		initUpload();

        addListener();
	}

	//获取用户详情 查看是否绑定手机号
	function getUserInfo() {
		return UserCtr.getUser().then(function(data) {
			if(data.mobile){
				isBindMobile = true;
			}else{
				isBindMobile = false
			}
		});
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
					},
					fileAdd: function(up, file, oriFile){
						base.showLoading('上传中')
					},
					fileUploaded: function(up, url, key, file){
			            var picHtml = `<div data-url="${key}" style="background-image: url('${PIC_PREFIX+key}?imageMogr2/auto-orient/thumbnail/!400x400r');" class="pic">
			              <i class="delete"></i>
			              <div class="pic-extra-wrapper">
			                <div class="upload-progress"></div>
			              </div>
			            </div>`;
			            $("#uploadContainer").before(picHtml);
			            base.hideLoading();
					}
				});

			}, () => {})
	}

	function addListener(){

		BindMobile.addMobileCont({
        	success: function() {
        		isBindMobile = true;
        		$("#subBtn").click()
        	},
        	error: function(msg) {
        		isBindMobile = false;
        		base.showMsg(msg);
        	},
        	hideBack: 1
        });

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

			if(!isBindMobile){
				BindMobile.showMobileCont();
			}else{
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
			}
	    })

	    //删除
	    $("#picWrap").on("click",".pic .delete", function(){
	    	$(this).parent('.pic').remove();
	    })
	}
})
