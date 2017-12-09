define([
    'jquery',
    'app/controller/base',
    'app/interface/LeaseCtr',
], function ($, base , LeaseCtr) {
    var tmpl = __inline("index.html");
    var defaultOpt = {};
    var firstAdd = true;
	var g = 12;
	var k = 0;
    var nDivHight = 0;
    var config = {
        start: 1,
        limit: 10,
        orderColumn:'order_no',
        orderDir:'asc'
    }, isEnd = false, canScrolling = false;

    function initData(){
        base.showLoading();
        getPageMalLList();
    }
    
    //商品分页查
	function getPageMalLList(){
		var html = ''
		if (k >= g) {
            isEnd = true;
        }
		if(k < g){
			for (var i=0; i<5&&k<g; i++) {
				k++
				html+=`<div class="mall-item" >
					<div class="choose fl"></div>
					<div class="mall-item-img fl" style="background-image: url('/static/images/default-bg.png');"></div>
					<div class="mall-item-con fl">
						<p class="name">名称名称名称名称名称名称名称名称名称名称名称名称名称名称名称名称名称名称</p>
						<samp class="slogan">秋冬新品</samp>
						<div class="price">
							<samp class="samp1">￥99.00</samp>
							<samp class="samp2">市场参考价: ￥199.00</samp>
						</div>
					</div>
				</div>`
			}	
		}
		$("#LeaseListContainer .chooseMallList-wrap").append(html)
		isEnd && $("#loadAll").removeClass("hidden");
		canScrolling = true;
		base.hideLoading();
	}
	
    function addListener(){
    	var nScrollHight = 0; //滚动距离总长(注意不是滚动条的长度)
	    var nScrollTop = 0;  //滚动到的当前位置
	    
		$("#LeaseListContainer").off("scroll").on("scroll", function() {
	    	nScrollHight = $(this)[0].scrollHeight;
	    	nScrollTop = $(this)[0].scrollTop;
			
            if (canScrolling && !isEnd && (nScrollTop + nDivHight + 10 >= nScrollHight)) {
                canScrolling = false;
                base.showLoading();
                getPageMalLList();
            }
        });
        
        //重新选择
        $("#LeaseListContainer").on("click", ".right-left-btn .resetBtn", function(){
        	$("#LeaseListContainer .chooseMallList-wrap .mall-item").removeClass("active")
        });
        
        var _activeMall; //当前点击的商品
        
        //商品选择
        $("#LeaseListContainer .chooseMallList-wrap").on("click",".mall-item", function(){
        	
        	if($(this).hasClass("active")){
        		$(this).removeClass("active")
        	}else{
        		_activeMall= $(this)
        		showProductSpecs();
        	}
        })
        
        //规格面板-确定按钮点击
        $("#leasePanel .productSpecs-btn .subBtn").click(function(){
        	_activeMall.addClass("active")
        	closeProductSpecs()
        })
        
        //关闭商品规格
		$("#leasePanel .close").click(function(){
			closeProductSpecs();
		})
		
		//购买数量 减
		$('.productSpecs-number .subt').click(function(){
			var sum = +$('#leasePanel .productSpecs-number .sum').html()
			if(sum>1){
				sum--
			}
			$('#leasePanel .productSpecs-number .sum').html(sum)
		})
		
		//购买数量 加
		$('.productSpecs-number .add').click(function(){
			var sum = +$('#leasePanel .productSpecs-number .sum').html()
			if(sum<$("#leasePanel .quantity").attr('data-quantity')){
				sum++
			}
			$('#leasePanel .productSpecs-number .sum').html(sum)
		})
        
	}
    
    //显示商品规格面板
	function showProductSpecs(t){
		//t=1,加入购物车；t=2,立即下单
		$("#mask").removeClass('hidden');
		$("#subBtn").removeClass('purchaseBtn').removeClass('addSCarBtn');
		$("#leasePanel").addClass('active');
	}
	
	//关闭商品规格面板
	function closeProductSpecs(){
		$("#mask").addClass('hidden');
		$("#leasePanel").removeClass('active');
		
		//还原选中数据
		var _specP1 = $("#specs1 .spec p").eq(0);
		var _specP2 = $("#specs2 .spec p").eq(0);
		var type = 1;
		
		$("#specs1 .spec p").removeClass("inStock").addClass("inStock").removeClass("active");
		$("#specs2 .spec p").removeClass("inStock").addClass("inStock").removeClass("active");
		
		if($("#specs2").hasClass('hidden')){//只有规格1
			$("#leasePanel .price").html(type==JFPRODUCTTYPE ? base.formatMoney(_specP1.attr("data-price"))+'积分' : '￥'+base.formatMoney(_specP1.attr("data-price")))
			$("#leasePanel .quantity").html('库存 ' + _specP1.attr("data-quantity")).attr('data-quantity',_specP1.attr("data-quantity"))
			$("#leasePanel .choice i").html(_specP1.attr("data-name"))
			$("#leasePanel .productSpecs-img").css('background-image','url("'+base.getImg(_specP1.attr("data-pic"))+'")')
			$('#leasePanel .productSpecs-number .sum').html(1)
		}else{
			$("#leasePanel .price").html(type==JFPRODUCTTYPE ? base.formatMoney(_specP2.attr("data-price"))+'积分' : '￥'+base.formatMoney(_specP2.attr("data-price")))
			$("#leasePanel .quantity").html('库存 ' + _specP2.attr("data-quantity")).attr('data-quantity',_specP2.attr("data-quantity"))
			$("#leasePanel .choice i").html(_specP2.attr("data-name"))
			$("#leasePanel .productSpecs-img").css('background-image','url("'+base.getImg(_specP2.attr("data-pic"))+'")')
			$('#leasePanel .productSpecs-number .sum').html(1)
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
            var wrap = $("#LeaseListContainer");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").text(defaultOpt.title);
            var that = this;
            if(firstAdd){
            	
        		addListener();
        		
                wrap.on("click", ".right-left-cont-back", function(){
                    ModuleObj.hideCont(defaultOpt.success);
                });
                
                wrap.on("click", ".right-left-btn .subBtn", function(){
                    ModuleObj.hideCont(defaultOpt.success);
                });
                
            }

            firstAdd = false;
            return this;
        },
        hasCont: function(){
            return !!$("#LeaseListContainer").length;
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
            var wrap = $("#LeaseListContainer");
            wrap.show().animate({
                left: 0
            }, 200, function(){
                defaultOpt.showFun && defaultOpt.showFun();
            });
            
            var topWrap = $(".right-left-cont-title");
            topWrap.show().animate({
                left: 0
            }, 200, function () {
            });
            
            var btnWrap = $(".right-left-btn");
            btnWrap.show().animate({
                left: 0
            }, 200, function () {
            });
            
            nDivHight = $("#LeaseListContainer .right-left-content").height();
        },
        hideCont: function (func){
            if(this.hasCont()){
            	var falg = false;
//          	if($("#LeaseListContainerContent .addressWrap").length){
//          		$("#LeaseListContainerContent .addressWrap").each(function(i, d){
//	            		if($(this).find('.xzIcon').hasClass('active')){
//	            			dCode = $(this).find('.addressWrap-detail').attr('data-code')
//	            			pojoConfig.receiver = $(this).find('.addressee').html();
//				        	pojoConfig.reMobile = $(this).find('.mobile').text()
//				        	pojoConfig.reAddress = $(this).find('.province').html()+' '+$(this).find('.city').html()+' '+$(this).find('.district').html()+' '+$(this).find('.detailAddress').html();
//				        	
//				        	falg = true
//				        	return false;
//	            		}
//	            	})
//          	}
            	
            	if(!falg){
            	}
            	
            	var topWrap = $(".right-left-cont-title");
                topWrap.animate({
                    left: "100%"
                }, 200, function () {
                    btnWrap.hide();
                });
            	
                var btnWrap = $(".right-left-btn");
                btnWrap.animate({
                    left: "100%"
                }, 200, function () {
                    btnWrap.hide();
                });
                
                var wrap = $("#LeaseListContainer");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func();
                    wrap.find("label.error").remove();
                });
                
            }
            return this;
        }
    }
    return ModuleObj;
});
