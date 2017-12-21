define([
    'jquery',
    'app/controller/base',
    'app/util/handlebarsHelpers',
    'app/interface/MallCtr',
], function ($, base, Handlebars, MallCtr) {
    var tmpl = __inline("index.html");
    var _mallTmpl = __inline('../../ui/mall-list-activity.handlebars');
    var defaultOpt = {};
    var firstAdd = true;
    var nDivHight = 0;
    var config = {
        start: 1,
        limit: 10,
        orderColumn:'order_no',
        orderDir:'asc',
        category: 'NJ01',
    }, isEnd = false, canScrolling = false;
    var proList = [];
    
	//为商品规格点击事件搭建关系
	var specsArray1 ={};//规格1['规格1':{['规格2'：'code']},'规格1':{['规格2'：'code']}]
	var specsArray2 ={};//规格2['规格2':{['规格1'：'规格1']},'规格2':{['规格1'：'规格1']}]
	var productSpecsListArray={}

    function initData(){
        base.showLoading();
        config.start = 1;
        getPageMalLList(true);
    }
    
    //商品分页查
	function getPageMalLList(refresh){
		
		MallCtr.getPageProduct(config, refresh)
            .then(function(data) {
                base.hideLoading();
                var lists = data.list;
                var totalCount = data.totalCount;//+lists.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                }
    			if(lists.length) {
    				
                    $("#MallListContainer .chooseMallList-wrap")[refresh || config.start == 1 ? "html" : "append"](_mallTmpl({items: lists}));
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
    			} else if(config.start == 1) {
                    $("#MallListContainer .chooseMallList-wrap").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂无商品</p></div>')
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                canScrolling = true;
        	}, base.hideLoading);
	}
	
	//获取商品详情
	function getProductDetail(c){
		base.showLoading();
		MallCtr.getProductDetail(c).then((data)=>{
			
			var type = data.category;
			
			$("#specsName1").html(data.specsName1)
			$("#specsName2").html(data.specsName2)
			
			if(data.specsName2){
				$("#specs2").removeClass("hidden")
				$("#specs2").addClass("productSpecs-wrap")
				$("#specs1").removeClass("productSpecs-wrap")
			}else{
				$("#specs2").addClass("hidden")
				$("#specs1").addClass("productSpecs-wrap")
				$("#specs2").removeClass("productSpecs-wrap")
			}
			
			$("#productSpecs .productSpecs-img").css('background-image','url("'+base.getImg(data.productSpecsList[0].pic)+'")')
			$("#productSpecs .price").html(type==JFPRODUCTTYPE ? base.formatMoney(data.productSpecsList[0].price2)+'积分' : '￥'+base.formatMoney(data.productSpecsList[0].price1))
			$("#productSpecs .quantity").html('库存 ' + data.productSpecsList[0].quantity).attr('data-quantity',data.productSpecsList[0].quantity)
			$("#productSpecs .choice i").html(data.productSpecsList[0].name)
			
			//规格
			var specHtml1 = "";
			var specHtml2 = "";
			var specsName1List =[];
			var specsName2List =[];
			
			specsArray1 ={};//规格1['规格1':{['规格2'：'code']},'规格1':{['规格2'：'code']}]
			specsArray2 ={};//规格2['规格2':{['规格1'：'规格1']},'规格2':{['规格1'：'规格1']}]
			productSpecsListArray={}
			
			data.productSpecsList.forEach(function(d, i){
				
				productSpecsListArray[d.code]=d;
				
				if(data.specsName2){
					if(!specsName1List[d.specsVal1]){
						specHtml1+=`<p class='inStock' >${d.specsVal1}</p>`;
						specsName1List[d.specsVal1]=d.specsVal1;
						
					}
					//为点击事件搭建关系
					var tmpl1 = {};
					tmpl1[d.specsVal2]=d.code;
					$.extend(tmpl1, specsArray1[d.specsVal1])
					specsArray1[d.specsVal1]=tmpl1
					
					var tmpl2 = {};
					tmpl2[d.specsVal1]=d.specsVal1;
					$.extend(tmpl2, specsArray2[d.specsVal2])
					specsArray2[d.specsVal2]=tmpl2
					
				}else{
					specHtml1+=`<p class='${d.quantity=="0"?"":"inStock"}' 
						data-code='${d.code}'
						data-price='${type==JFPRODUCTTYPE ? d.price2 : d.price1}' 
						data-quantity="${d.quantity}" 
						data-name="${d.specsVal1}" 
						data-pic="${d.pic}" >${d.specsVal1}</p>`;
					
					specsName1List[d.specsVal1]=d.specsVal1;
				}
				if(data.specsName2&&!specsName2List[d.specsVal2]){
					var inStock = '';
					if(d.quantity!='0'){
						inStock = "inStock";
					}else{
						inStock = ""
					}
					
					specHtml2+=`<p class='${inStock}' 
						data-code='${d.code}'
						data-price='${type==JFPRODUCTTYPE ? d.price2 : d.price1}' 
						data-quantity='${d.quantity}' 
						data-name='${d.specsVal2}'  
						data-specsVal1='${d.specsVal1}'  
						data-pic="${d.pic}" >${d.specsVal2}</p>`;
					
					specsName2List[d.specsVal2]=d.specsVal2;
				}
			})
			$("#specs1 .spec").html(specHtml1);
			$("#specs2 .spec").html(specHtml2);
			
			if(data.specsName2){
				//有规格2时为规格1绑定点击事件
				$("#specs1 .spec").off('click').on('click','p.inStock',function(){
					var _specPInStock = $(this);
					
					//如果规格1 已选中 移除选中
					if(_specPInStock.hasClass('active')){
						_specPInStock.removeClass("active")
						
					//如果规格1没有选中	添加选中
					}else{
						_specPInStock.addClass('active').siblings().removeClass('active');
					}
					
					//规格2
					$("#specs2 .spec p").removeClass("inStock");
					//遍历规格2 为属于当前点击规格的规格2 添加inStock
					
					$("#specs2 .spec p").each(function(i, d){
						var _specP = $(this);
						
						//如果规格1已选中 
						if(!_specPInStock.hasClass('active')){
							if(_specP.attr("data-quantity")!='0'){//显示 有库存的 规格
								_specP.addClass("inStock");
							}
						
						//如果规格1 没有选中
						}else{
							//遍历出当前点击规格1 关联的规格2
							Object.keys(specsArray1[_specPInStock.text()]).forEach(function(v, j){
								if(_specP.attr("data-name")==v &&_specP.attr("data-quantity")!='0'){//显示 规格1的 规格
									_specP.addClass("inStock");
								}
							})
						}
					})
					var _specPChoice1 = $("#specs1 .spec p.active").length?$("#specs1 .spec p.active").text():'';
					var _specPChoice2 = $("#specs2 .spec p.active").length?$("#specs2 .spec p.active").attr("data-name"):'';
					
					$("#productSpecs .choice i").html(_specPChoice1+' '+_specPChoice2)
					if(_specPChoice1&&_specPChoice2){
						var specsCode = specsArray1[_specPChoice1][_specPChoice2]
						var specsData = productSpecsListArray[specsCode];
						
						$("#productSpecs .price").html('￥'+base.formatMoney(specsData.price1))
						$("#productSpecs .price").attr("data-price",specsData.price1)
						$("#productSpecs .quantity").html('库存 ' + specsData.quantity).attr('data-quantity',specsData.quantity)
						$("#productSpecs .productSpecs-img").css('background-image','url("'+base.getImg(specsData.pic)+'")')
					}
				})
				
				//有规格2时为规格2绑定点击事件
				$("#specs2 .spec").off('click').on('click','p.inStock',function(){
					var _specP = $(this);
					
					//如果规格2 已选中 移除选中
					if(_specP.hasClass('active')){
						_specP.removeClass("active")
						
					//如果规格2 没有选中	添加选中
					}else{
					
						_specP.addClass('active').siblings().removeClass('active');
					}
					
					$("#specs1 .spec p").removeClass("inStock");
					
					//遍历规格1  为当前点击规格属于的规格1 添加inStock
					$("#specs1 .spec p").each(function(i, d){
						var _specs_specP= $(this);
						
						//如果规格1已 
						if(!_specP.hasClass('active')){
							if(_specP.attr("data-quantity")!='0'){//显示 规格1的 规格
								_specs_specP.addClass("inStock");
							}
							
						//如果规格2 没有选中	
						}else{
							//遍历出当前点击规格2 关联的规格1
							Object.keys(specsArray2[_specP.attr("data-name")]).forEach(function(v, j){
								if(_specs_specP.text()==v &&_specP.attr("data-quantity")!='0'){//显示 规格1的 规格
									_specs_specP.addClass("inStock");
								}
							})
						}
					})
					
					var _specPChoice1 = $("#specs1 .spec p.active").length?$("#specs1 .spec p.active").text():'';
					var _specPChoice2 = $("#specs2 .spec p.active").length?$("#specs2 .spec p.active").attr("data-name"):'';
					
					$("#productSpecs .choice i").html(_specPChoice1+' '+_specPChoice2)
						
					if(_specPChoice1&&_specPChoice2){
						var specsCode = specsArray1[_specPChoice1][_specPChoice2]
						var specsData = productSpecsListArray[specsCode];
						
						$("#productSpecs .price").html('￥'+base.formatMoney(specsData.price1))
						$("#productSpecs .price").attr("data-price",specsData.price1)
						$("#productSpecs .quantity").html('库存 ' + specsData.quantity).attr('data-quantity',specsData.quantity)
						$("#productSpecs .productSpecs-img").css('background-image','url("'+base.getImg(specsData.pic)+'")')
					}
					$('#productSpecs .productSpecs-number .sum').html(1)
					
				})
				
			}else{
				//没有规格2时为规格1绑定点击事件
				$("#specs1 .spec").off('click').on('click','p.inStock', function(){
					var _specP = $(this);
					
					_specP.addClass('active').siblings().removeClass('active');
					$("#productSpecs .price").html(type==JFPRODUCTTYPE ? base.formatMoney(_specP.attr("data-price"))+'积分' : '￥'+base.formatMoney(_specP.attr("data-price")))
					$("#productSpecs .price").attr("data-price",_specP.attr("data-price"))
					$("#productSpecs .quantity").html('库存 ' + _specP.attr("data-quantity")).attr('data-quantity',_specP.attr("data-quantity"))
					$("#productSpecs .choice i").html(_specP.attr("data-name"))
					$("#productSpecs .productSpecs-img").css('background-image','url("'+base.getImg(_specP.attr("data-pic"))+'")')
					$('#productSpecs .productSpecs-number .sum').html(1)
					
				})
			}
			
			
			base.hideLoading();
    		//显示面板
    		showProductSpecs();
    		
		},()=>{})
	}
	
    function addListener(){
        
        //重新选择
        $("#MallListContainer").on("click", ".right-left-btn .resetBtn", function(){
        	proList=[];
        	$("#MallListContainer .chooseMallList-wrap .mall-item").removeClass("active")
        });
        
        var _activeMall; //当前点击的商品
        
        //商品选择
        $("#MallListContainer .chooseMallList-wrap").on("click",".mall-item", function(){
        	
        	if($(this).hasClass("active")){
        		$(this).removeClass("active")
        	}else{
        		_activeMall= $(this);
        		//查询商品详情
        		getProductDetail($(this).attr("data-code"));
        	}
        })
        
        //规格面板-确定按钮点击
        $("#productSpecs .productSpecs-btn .subBtn").click(function(){
        	var productSpecs = '';
        	var flag = false;
        	
        	if($("#specs2").hasClass('hidden')&&$("#specs1 .spec p.active").text()){//只有规格1
				productSpecs=$("#specs1 .spec p.active").text();
				productSpecs?flag=true:flag=false;
				
				_activeMall.attr("data-specCode",$("#specs1 .spec p.active").attr('data-code'))
				
			}else if($("#specs1 .spec p.active").text()&&$("#specs2 .spec p.active").attr('data-name')){
				$("#specs1 .spec p.active").text()?flag=true:flag=false;
				productSpecs=$("#specs1 .spec p.active").text()+" "+$("#specs2 .spec p.active").text();
				_activeMall.attr("data-specCode",specsArray1[$("#specs1 .spec p.active").text()][$("#specs2 .spec p.active").attr('data-name')])
				
			}else{
				flag=false;
				base.showMsg('请选择商品规格')
			}
			if(flag){
				_activeMall.find(".price .samp1").text($("#productSpecs .price").text())
				_activeMall.find(".price .samp1").attr("data-price",$("#productSpecs .price").attr("data-price"))
				_activeMall.find(".price .samp2").text("X"+$("#productSpecs .productSpecs-number .sum").text())
				_activeMall.find(".price .samp2").attr("data-quantity",$("#productSpecs .productSpecs-number .sum").text())
	        	_activeMall.find(".slogan").text(productSpecs)
	        	_activeMall.addClass("active");
	        	
        		closeProductSpecs();
			}
        	
        })
        
        //关闭商品规格
		$("#productSpecs .close").click(function(){
			closeProductSpecs();
		})
		
		//购买数量 减
		$('.productSpecs-number .subt').click(function(){
			var sum = +$('#productSpecs .productSpecs-number .sum').html()
			if(sum>1){
				sum--
			}
			$('#productSpecs .productSpecs-number .sum').html(sum)
		})
		
		//购买数量 加
		$('.productSpecs-number .add').click(function(){
			var sum = +$('#productSpecs .productSpecs-number .sum').html()
			if(sum<$("#productSpecs .quantity").attr('data-quantity')){
				sum++
			}
			$('#productSpecs .productSpecs-number .sum').html(sum)
		})
        
	}
    
    //显示商品规格面板
	function showProductSpecs(t){
		$("#mask").removeClass('hidden');
		$("#productSpecs").addClass('active');
	}
	
	//关闭商品规格面板
	function closeProductSpecs(){
		$("#mask").addClass('hidden');
		$("#productSpecs").removeClass('active');
		
		//还原选中数据
		var _specP1 = $("#specs1 .spec p").eq(0);
		var _specP2 = $("#specs2 .spec p").eq(0);
		var type = 1;
		
		$("#specs1 .spec p").removeClass("inStock").addClass("inStock").removeClass("active");
		$("#specs2 .spec p").removeClass("inStock").addClass("inStock").removeClass("active");
		
		if($("#specs2").hasClass('hidden')){//只有规格1
			$("#productSpecs .price").html(type==JFPRODUCTTYPE ? base.formatMoney(_specP1.attr("data-price"))+'积分' : '￥'+base.formatMoney(_specP1.attr("data-price")))
			$("#productSpecs .price").attr("data-price",_specP1.attr("data-price"))
			$("#productSpecs .quantity").html('库存 ' + _specP1.attr("data-quantity")).attr('data-quantity',_specP1.attr("data-quantity"))
			$("#productSpecs .choice i").html(_specP1.attr("data-name"))
			$("#productSpecs .productSpecs-img").css('background-image','url("'+base.getImg(_specP1.attr("data-pic"))+'")')
			$('#productSpecs .productSpecs-number .sum').html(1)
		}else{
			$("#productSpecs .price").html(type==JFPRODUCTTYPE ? base.formatMoney(_specP2.attr("data-price"))+'积分' : '￥'+base.formatMoney(_specP2.attr("data-price")))
			$("#productSpecs .price").attr("data-price",_specP2.attr("data-price"))
			$("#productSpecs .quantity").html('库存 ' + _specP2.attr("data-quantity")).attr('data-quantity',_specP2.attr("data-quantity"))
			$("#productSpecs .choice i").html(_specP2.attr("data-name"))
			$("#productSpecs .productSpecs-img").css('background-image','url("'+base.getImg(_specP2.attr("data-pic"))+'")')
			$('#productSpecs .productSpecs-number .sum').html(1)
		}
		
	}
	
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
            var wrap = $("#MallListContainer");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").text(defaultOpt.title);
            var that = this;
            if(firstAdd){
            	
        		addListener();
        		
                wrap.on("click", ".right-left-cont-back", function(){
                	proList=[];
                    ModuleObj.hideCont(defaultOpt.success);
                });
                
                wrap.on("click", ".right-left-btn .subBtn", function(){
                	proList=[];
					$("#MallListContainer .chooseMallList-wrap .mall-item").each(function(){
						if($(this).hasClass("active")){
							var pro = {
								code: $(this).attr("data-code"),
								speccode: $(this).attr("data-speccode"),
								name: $(this).find(".name").text(),
								advPic: $(this).find(".mall-item-img").attr("data-advPic"),
								price: $(this).find(".price .samp1").attr("data-price"),
								quantity: $(this).find(".price .samp2").attr("data-quantity"),
								productSpecs: $(this).find(".slogan").text()
							}
							
							proList.push(pro)
						}
					})
                    ModuleObj.hideCont(defaultOpt.success);
                });
                
            }

            firstAdd = false;
            return this;
        },
        hasCont: function(){
            return !!$("#MallListContainer").length;
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
            var wrap = $("#MallListContainer");
            wrap.show().animate({
                left: 0
            }, 200, function(){
                defaultOpt.showFun && defaultOpt.showFun();
            });
            
            var topWrap = wrap.find(".right-left-cont-title");
            topWrap.show().animate({
                left: 0
            }, 200, function () {
            });
            
            var btnWrap =  wrap.find(".right-left-btn");
            btnWrap.show().animate({
                left: 0
            }, 200, function () {
            });
            
            //下拉加载
            wrap.off("scroll").on("scroll", function() {
                if (canScrolling && !isEnd && (wrap.scrollTop()>=wrap.find(".right-left-content").height()-wrap.height()-20)) {
                	
                    canScrolling = false;
                    base.showLoading();
                    getPageMalLList();
                }
            });
        },
        hideCont: function (func){
            if(this.hasCont()){
				
                var wrap = $("#MallListContainer");
                
            	var topWrap =  wrap.find(".right-left-cont-title");
                topWrap.animate({
                    left: "100%"
                }, 200, function () {
                    btnWrap.hide();
                });
            	
                var btnWrap =  wrap.find(".right-left-btn");
                btnWrap.animate({
                    left: "100%"
                }, 200, function () {
                    btnWrap.hide();
                });
                
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func(proList);
                    wrap.find("label.error").remove();
                });
                
            }
            return this;
        }
    }
    return ModuleObj;
});
