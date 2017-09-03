define([
    'jquery',
    'app/module/validate',
    'app/module/loading',
    'app/interface/UserCtr'
], function ($, Validate, loading , UserCtr) {
    var tmpl = __inline("index.html");
    var defaultOpt = {};
    var toUser = "";
    var toUserName = "" ;
    var firstAdd = true;

    function initData(){
        loading.createLoading();
        $("#userId").val(defaultOpt.userId);
        
        getPagePartner();
        addListener()
    }
    
    //提货点
	function getPagePartner(){
		UserCtr.getPagePartner(true)
        .then(function(data){
            	var html = '<div class="titleWrap" data-userId='+SYS_USER+'><p class="fl text name">'+SYS_USERNAME+'</p><p class="fr text"><i class="icon"></i></p></div>';
            	
        		data.list.forEach(function(d, i){
        			html+=`<div class="titleWrap" data-userId='${d.userId}'><p class="fl text name">${d.realName}</p>
        			<p class="fr text"><i class="icon"></i></p></div>`
        		})
        		
            	$("#expressList").html(html);
            	
        	loading.hideLoading();
        });
	}
	
	function addListener(){
		$("#expressList").on('click', '.titleWrap',function(){
    		toUser = $(this).attr('data-userId');
    		toUserName = $(this).find(".name").html();
    		ModuleObj.hideCont(defaultOpt.success);
    	})
	}
	
    var ModuleObj = {
        addCont: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasCont()){
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var wrap = $("#expressListContainer");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").text(defaultOpt.title);
            var that = this;
            if(firstAdd){
                var _form = $("#addOrEditAddressForm");
                wrap.on("click", ".right-left-cont-back", function(){
                    ModuleObj.hideCont(defaultOpt.success);
                });
                wrap.find(".right-left-cont-title")
                    .on("touchmove", function(e){
                        e.preventDefault();
                    });
            }
            firstAdd = false;
            return this;
        },
        hasCont: function(){
            return !!$("#expressListContainer").length;
        },
        showCont: function (option = {}){
            if(this.hasCont()){
            	if(option.code) {
                    defaultOpt.code = option.code;
                } else {
                    defaultOpt.code = "";
                }
                initData();
                ModuleObj._showCont();
            }
            return this;
        },
        _showCont: function(){
            var wrap = $("#expressListContainer");
            wrap.show().animate({
                left: 0
            }, 200, function(){
                defaultOpt.showFun && defaultOpt.showFun();
            });
            
            var btnWrap = $(".right-left-btn");
            btnWrap.show().animate({
                left: 0
            }, 200, function () {
            });
        },
        hideCont: function (func){
            if(this.hasCont()){
                
                var wrap = $("#expressListContainer");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func(toUser, toUserName);
                    wrap.find("label.error").remove();
                });
                
            }
            return this;
        }
    }
    return ModuleObj;
});
