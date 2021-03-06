define([
    'jquery',
    'app/module/validate',
    'app/module/loading',
    'app/interface/AccountCtr',
    'app/interface/UserCtr'
], function ($, Validate, loading, AccountCtr, UsertCtr) {
    var tmpl = __inline("index.html");
    var defaultOpt = {};
    var firstAdd = true;

    function initData(){
        loading.createLoading();
        $("#userId").val(defaultOpt.userId);
        // 添加银行卡
        if(!defaultOpt.code){
            return getAddInitData();
        }
        // 修改银行卡
        return getEditInitData();
    }
    // 获取添加银行卡初始化数据
    function getAddInitData() {
        return $.when(
            UsertCtr.getUser(),
            getBankCode()
        ).then(function (data) {
            loading.hideLoading();
            data.realName && $("#realName").val(data.realName);
            data.mobile && $("#bindMobile").val(data.mobile);
        })
    }
    // 获取修改银行卡初始化数据
    function getEditInitData() {
        return $.when(
            getBankCard(),
            getBankCode()
        ).then(function (data) {
            loading.hideLoading();
            $("#bankName").val(data.bankName).trigger("change");
            $("#realName").val(data.realName);
            $("#bindMobile").val(data.bindMobile);
            $("#bankcardNumber").val(data.bankcardNumber);
            $("#payCardInfo").val(data.payCardInfo);
        })
    }
    // 添加银行卡
    function addBankCard(){
        loading.createLoading("保存中...");
        var param = $("#addOrEditBankCardForm").serializeObject();
        AccountCtr.addBankCard(param)
            .then(function(){
                loading.hideLoading();
                ModuleObj.hideCont(defaultOpt.success);
            }, function(msg){
                defaultOpt.error && defaultOpt.error(msg || "添加账号失败");
            });
    }
    // 修改银行卡
    function editBankCard() {
        loading.createLoading("保存中...");
        var param = $("#addOrEditBankCardForm").serializeObject();
        param.code = defaultOpt.code;
        AccountCtr.editBankCard(param)
            .then(function(){
                loading.hideLoading();
                ModuleObj.hideCont(defaultOpt.success);
            }, function(msg){
                defaultOpt.error && defaultOpt.error(msg || "添加账号失败");
            });
    }

    // 根据code获取银行卡详情
    function getBankCard(){
        return AccountCtr.getBankCard(defaultOpt.code, true);
    }

    // 获取银行select列表
    function getBankCode(){
        return AccountCtr.getBankCodeList().then(function(data){
            var html = "";
            data.forEach(function(item){
                html += '<option value="'+item.bankName+'" code="'+item.bankCode+'">'+item.bankName+'</option>';
            });
            $("#bankName").html(html).trigger("change");
        });
    }
    var ModuleObj = {
        addCont: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasCont()){
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var wrap = $("#addOrEditBankCardContainer");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").text(defaultOpt.title);
            var that = this;
            if(firstAdd){
                var _form = $("#addOrEditBankCardForm");
                wrap.on("click", ".right-left-cont-back", function(){
                    ModuleObj.hideCont(defaultOpt.hideFn);
                });
                wrap.find(".right-left-cont-title")
                    .on("touchmove", function(e){
                        e.preventDefault();
                    });
                $("#addOrEditBankCardBtn")
                    .on("click", function(){
                        if(_form.valid()){
                            if(defaultOpt.code){
                                editBankCard();
                            }else{
                                addBankCard();
                            }
                        }
                    });
                _form.validate({
                    'rules': {
                        realName: {
                            required: true,
                            isNotFace: true,
                            maxlength: 16
                        },
                        bankName: {
                            required: true
                        },
                        payCardInfo: {
                            required: true,
                            isNotFace: true,
                            maxlength: 255
                        },
                        bindMobile: {
                            required: true,
                            mobile: true
                        },
                        bankcardNumber: {
                            required: true,
                            bankCardOrMobile: true
                        }
                    },
                    onkeyup: false
                });
                $("#bankName").on("change", function(){
                    $("#bankCode").val($("#bankName option:selected").attr("code"));
                    if($("#bankName option:selected").attr("code") == 'alipay'){
                    	$("#bankcardNumber").val("")
                    	$(".bank-wrap").addClass('hidden');
                    }else {
                    	$("#bankcardNumber").val("")
                    	$(".bank-wrap").removeClass('hidden')
                    }
                });
            }

            firstAdd = false;
            return this;
        },
        hasCont: function(){
            return !!$("#addOrEditBankCardContainer").length;
        },
        showCont: function (option = {}){
            if(this.hasCont()){
                if(option.code) {
                    defaultOpt.code = option.code;
                    $("#addOrEditBankCardContainer").find(".right-left-cont-title-name").text("修改账号");
                } else {
                    defaultOpt.code = "";
                    $("#addOrEditBankCardContainer").find(".right-left-cont-title-name").text("绑定账号");
                }
                initData().then(function(){
                    ModuleObj._showCont();
                });
            }
            return this;
        },
        _showCont: function(){
            var wrap = $("#addOrEditBankCardContainer");
            wrap.show().animate({
                left: 0
            }, 200, function(){
                defaultOpt.showFun && defaultOpt.showFun();
            });
        },
        hideCont: function (func){
            if(this.hasCont()){
                var wrap = $("#addOrEditBankCardContainer");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func($("#bankcardNumber").val(), $("#bankName").find("option:selected").text());
                    $("#realName").val("");
                    $("#payCardInfo").val("");
                    $("#bankcardNumber").val("");
                    wrap.find("label.error").remove();
                });
            }
            return this;
        }
    }
    return ModuleObj;
});
