define([
    'jquery',
    'picker',
    'app/module/validate',
    'app/module/loading',
    'app/interface/UserCtr'
], function ($, Picker , Validate, loading , UsertCtr) {
    var tmpl = __inline("index.html");
    var defaultOpt = {};
    var first = []; /* 省，直辖市 */
	var second = []; /* 市 */
	var third = []; /* 镇 */
	var selectedIndex = [0, 0, 0]; /* 默认选中的地区 */
	var checked = [0, 0, 0]; /* 已选选项 */
    var firstAdd = true;

    function initData(){
        loading.createLoading();
        $("#userId").val(defaultOpt.userId);
        // 添加收货地址
        if(!defaultOpt.code){
            return getAddInitData();
        }
        // 修改收货地址
        return getEditInitData();
    }
    // 获取添加收货地址初始化数据
    function getAddInitData() {
    	getPicker();
        loading.hideLoading();
    }
    // 获取修改收货地址初始化数据
    function getEditInitData() {
        return $.when(
            getAddress()
        ).then(function (data) {
            loading.hideLoading();
            $("#isDefault").val(data.isDefault);
            $("#addressee").val(data.addressee);
            $("#mobile").val(data.mobile);
			$("#city").val(data.province + ' ' + data.city + ' ' + data.district);
			$("#city").attr("data-prv",data.province);
			$("#city").attr("data-city",data.city);
			$("#city").attr("data-area",data.district);
			$("#detailAddress").val(data.detailAddress);
    		getPicker();
        })
    }
    // 添加收货地址
    function addAddress(){
        loading.createLoading("保存中...");
        var param = $("#addOrEditAddressForm").serializeObject();
        param.isDefault = 0;
        param.province = $("#city").attr("data-prv");
		param.city =$("#city").attr("data-city");
		param.district =$("#city").attr("data-area");
        UsertCtr.addAddress(param)
            .then(function(){
                loading.hideLoading();
                ModuleObj.hideCont(defaultOpt.success);
            }, function(msg){
                defaultOpt.error && defaultOpt.error(msg || "添加收货地址失败");
            });
    }
    // 修改收货地址
    function editAddress() {
        loading.createLoading("保存中...");
        var param = $("#addOrEditAddressForm").serializeObject();
        param.province = $("#city").attr("data-prv");
		param.city =$("#city").attr("data-city");
		param.district =$("#city").attr("data-area");
        param.code = defaultOpt.code;
        
        UsertCtr.editAddress(param)
            .then(function(){
                loading.hideLoading();
                ModuleObj.hideCont(defaultOpt.success);
            }, function(msg){
                defaultOpt.error && defaultOpt.error(msg || "修改收货地址失败");
            });
    }

    // 根据code获取收货地址详情
    function getAddress(){
        return UsertCtr.getAddressDetail(defaultOpt.code);
    }
    
    function getPicker(){
    	var _nameEl = $("#cityWrap")
		
		function creatList(obj, list){
		  obj.forEach(function(item, index, arr){
		  var temp = new Object();
		  temp.text = item.name;
		  temp.value = index;
		  list.push(temp);
		  })
		}
		
		creatList(city, first);
		
		if (city[selectedIndex[0]].hasOwnProperty('sub')) {
		  creatList(city[selectedIndex[0]].sub, second);
		} else {
		  second = [{text: '', value: 0}];
		}
		
		if (city[selectedIndex[0]].sub[selectedIndex[1]].hasOwnProperty('sub')) {
		  creatList(city[selectedIndex[0]].sub[selectedIndex[1]].sub, third);
		} else {
		  third = [{text: '', value: 0}];
		}
		
		var picker = new Picker({
			data: [first, second, third],
			selectedIndex: selectedIndex,
			title: '地址选择'
		});
		
		picker.on('picker.select', function (selectedVal, selectedIndex) {
		  var text1 = first[selectedIndex[0]].text;
		  var text2 = second[selectedIndex[1]].text;
		  var text3 = third[selectedIndex[2]] ? third[selectedIndex[2]].text : '';
		
			$("#city").val(text1 + ' ' + text2 + ' ' + text3);
			$("#city").attr("data-prv",text1);
			$("#city").attr("data-city",text2);
			$("#city").attr("data-area",text3);
			
		});
		
		picker.on('picker.change', function (index, selectedIndex) {
		  if (index === 0){
		    firstChange();
		  } else if (index === 1) {
		    secondChange();
		  }
		
			function firstChange() {
			    second = [];
			    third = [];
			    checked[0] = selectedIndex;
			    var firstCity = city[selectedIndex];
			    if (firstCity.hasOwnProperty('sub')) {
			      creatList(firstCity.sub, second);
			
			      var secondCity = city[selectedIndex].sub[0]
			      if (secondCity.hasOwnProperty('sub')) {
			        creatList(secondCity.sub, third);
			      } else {
			        third = [{text: '', value: 0}];
			        checked[2] = 0;
			      }
			    } else {
			      second = [{text: '', value: 0}];
			      third = [{text: '', value: 0}];
			      checked[1] = 0;
			      checked[2] = 0;
			    }
			
			    picker.refillColumn(1, second);
			    picker.refillColumn(2, third);
			    picker.scrollColumn(1, 0)
			    picker.scrollColumn(2, 0)
			}
			
			function secondChange() {
			    third = [];
			    checked[1] = selectedIndex;
			    var first_index = checked[0];
			    if (city[first_index].sub[selectedIndex].hasOwnProperty('sub')) {
			      var secondCity = city[first_index].sub[selectedIndex];
			      creatList(secondCity.sub, third);
			      picker.refillColumn(2, third);
			      picker.scrollColumn(2, 0)
			    } else {
			      third = [{text: '', value: 0}];
			      checked[2] = 0;
			      picker.refillColumn(2, third);
			      picker.scrollColumn(2, 0)
			    }
			}
		
		});
		
		picker.on('picker.valuechange', function (selectedVal, selectedIndex) {
//		  console.log(selectedVal);
//		  console.log(selectedIndex);
		});
		
		$("#cityWrap").on('click', function () {
			picker.show();
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
            var wrap = $("#addOrEditAddressContainer");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").text(defaultOpt.title);
            var that = this;
            if(firstAdd){
                var _form = $("#addOrEditAddressForm");
                wrap.on("click", ".right-left-cont-back", function(){
                    ModuleObj.hideCont(defaultOpt.hideFn);
                });
                wrap.find(".right-left-cont-title")
                    .on("touchmove", function(e){
                        e.preventDefault();
                    });
                $("#addOrEditAddressBtn")
                    .on("click", function(){
                        if(_form.valid()){
                            if(defaultOpt.code){
                                editAddress();
                            }else{
                                addAddress();
                            }
                        }
                    });
                _form.validate({
                    'rules': {
                        addressee: {
                            required: true,
                            isNotFace: true,
                            maxlength: 16
                        },
                        city: {
                            required: true
                        },
                        mobile: {
                            required: true,
                            mobile: true
                        },
                        detailAddress: {
                            required: true
                        },
                    },
                    onkeyup: false
                });
                
            }

            firstAdd = false;
            return this;
        },
        hasCont: function(){
            return !!$("#addOrEditAddressContainer").length;
        },
        showCont: function (option = {}){
            if(this.hasCont()){
                if(option.code) {
                    defaultOpt.code = option.code;
                    $("#addOrEditAddressContainer").find(".right-left-cont-title-name").text("修改收货地址");
                } else {
                    defaultOpt.code = "";
                    $("#addOrEditAddressContainer").find(".right-left-cont-title-name").text("新增收货地址");
                }
                initData();
                ModuleObj._showCont();
            }
            return this;
        },
        _showCont: function(){
            var wrap = $("#addOrEditAddressContainer");
            wrap.css("top", $(window).scrollTop()+"px");
            wrap.show().animate({
                left: 0
            }, 200, function(){
                defaultOpt.showFun && defaultOpt.showFun();
            });
        },
        hideCont: function (func){
            if(this.hasCont()){
                var wrap = $("#addOrEditAddressContainer");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func();
                    $("#isDefault").val("");
                    $("#addressee").val("");
                    $("#mobile").val("");
                    $("#city").val("");
                    $("#detailAddress").val("");
                    wrap.find("label.error").remove();
                    $(".picker").remove();
                });
            }
            return this;
        }
    }
    return ModuleObj;
});
