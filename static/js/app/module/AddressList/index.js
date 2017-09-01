define([
    'jquery',
    'app/controller/base',
    'app/module/validate',
    'app/module/loading',
    'app/interface/UserCtr',
    'app/module/addOrEditAddress'
], function ($, base, Validate, loading , UserCtr, addOrEditAddress) {
    var tmpl = __inline("index.html");
    var defaultOpt = {};
    var pojoConfig = {
    	receiver: "",
        reMobile: "",
        reAddress: "",
        applyUser: base.getUserId(),
        companyCode: SYSTEM_CODE,
        systemCode: SYSTEM_CODE
    }
    var firstAdd = true;

    function initData(){
        loading.createLoading();
        $("#userId").val(defaultOpt.userId);
        
        getAddressList();
        addListener();
    }
    
    //收货地址列表
	function getAddressList(){
		UserCtr.getAddressList(true)
        .then(function(data){
            if(data.length){
            	var html = '';
            	
        		data.forEach(function(v, i){
        			html+=`<div class="addressWrap ${v.isDefault==1?'active':''}"><div class="addressWrap-detail wp100" data-code="${v.code}">
            		<div class="wp100 mb10"><span class="addressee">${v.addressee}</span>
	            		<span class="mobile">${v.mobile}</span></div>
	            	<div class="wp100"><span class="province">${v.province}</span>
			            <span class="city">${v.city}</span>
			            <span class="district">${v.district}</span>
			            <span class="detailAddress">${v.detailAddress}</span></div>
			        <div class="icon ${v.code==defaultOpt.code?'active':''}"></div></div>
					<div class="operationWrap wp100"><div class="fl">
						<div class="iconWrap isDefaultBtn" data-code="${v.code}"><i class="icon icon-default"></i><p>${v.isDefault==1?'已设为默认':'设为默认'}</p></div></div>
						<div class="fr">
						<div class="fl mr20 iconWrap editBtn" data-code="${v.code}"><i class="icon icon-edit"></i><p>编辑</p></div>
						<div class="fl iconWrap deleteBtn" data-code="${v.code}"><i class="icon icon-delete"></i><p>删除</p></div>
					</div></div></div>`
        		})
        		
            	$("#content").html(html);
            	
            	$("footer").removeClass("hidden");
            	$("#loadAll").removeClass("hidden");
            }else{
                doError("#content");
            }
            
        	base.hideLoading();
        });
	}
    function addListener(){
		addOrEditAddress.addCont({
            userId: base.getUserId(),
            success: function() {
                ModuleObj.showCont();
            }
        });
		
		//新增
		$("#addBtn").click(function(){
			addOrEditAddress.showCont();
		})
		
		//修改
		$("#content").on("click", '.addressWrap .addressWrap-detail',function(){
			var _thisData = $(this);
			var html = '';
			
			html = `<div class="icon icon-dz"></div>
				<div class="wp100 over-hide"><samp class="fl addressee">收货人：${_thisData.find('.addressee').html()}</samp><samp class="fr mobile">${_thisData.find('.mobile').html()}</samp></div>
				<div class="detailAddress">收货地址： ${_thisData.find('.province').html()}  ${_thisData.find('.city').html()}  ${_thisData.find('.district').html()}  ${_thisData.find('.detailAddress').html()}</div>
				<div class="icon icon-more"></div>`
			
			$("#orderAddress").html(html).attr('data-code',_thisData.attr('data-code'));
			pojoConfig.receiver = _thisData.find('.addressee').html();
        	pojoConfig.reMobile = _thisData.find('.mobile').html()
        	pojoConfig.reAddress = _thisData.find('.province').html()+' '+_thisData.find('.city').html()+' '+_thisData.find('.district').html()+' '+_thisData.find('.detailAddress').html();
			ModuleObj.hideCont(defaultOpt.success);
		})
		
		//设为默认
		$("#content").on("click", '.addressWrap .isDefaultBtn',function(){
			
			base.confirm("确定该地址为默认地址？").then(()=>{
	    		base.showLoading("设置中...", 1);
				setDefaultAddress($(this).attr('data-code'));
				
	        	base.hideLoading();
			},()=>{})
			
		})
		
		//编辑
		$("#content").on("click", '.addressWrap .editBtn',function(){
    		addOrEditAddress.showCont({
				code : $(this).attr('data-code')
			});
		})
		
		//删除
		$("#content").on("click", '.addressWrap .deleteBtn',function(){
			
			base.confirm("确认删除该地址？").then(()=>{
	    		base.showLoading("删除中...", 1);
				deleteAddress($(this).attr('data-code'));
        		base.hideLoading();
			},()=>{})
			
		})
		
	}
	
	//设置默认地址
	function setDefaultAddress(c){
		UserCtr.setDefaultAddress(c).then(()=>{
			location.reload(true);
		},()=>{},)
	}
	
	//删除地址
	function deleteAddress(c){
		UserCtr.deleteAddress(c).then(()=>{
			ModuleObj.showCont();
		},()=>{},)
	}
	
	//
    function doError(cc) {
        $(cc).html('<div style="text-align: center;line-height: 3;">暂无数据</div>');
    }

    var ModuleObj = {
        addCont: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasCont()){
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var wrap = $("#AddressListContainer");
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
            return !!$("#AddressListContainer").length;
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
            var wrap = $("#AddressListContainer");
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
                var btnWrap = $(".right-left-btn");
                btnWrap.animate({
                    left: "100%"
                }, 200, function () {
                    btnWrap.hide();
                });
                
                var wrap = $("#AddressListContainer");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func(pojoConfig);
                    wrap.find("label.error").remove();
                });
                
            }
            return this;
        }
    }
    return ModuleObj;
});
