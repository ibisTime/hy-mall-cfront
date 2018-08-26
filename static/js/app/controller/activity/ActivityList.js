define([
    'app/controller/base',
    'app/module/foot',
    'picker',
    'app/util/handlebarsHelpers',
    'app/interface/GeneralCtr',
    'app/interface/ActivityStr'
], function(base, Foot, Picker, Handlebars, GeneralCtr, ActivityStr) {
    var searchVal = base.getUrlParam('searchVal') || "";
    var placeDestCity = base.getUrlParam('city') || "";
    var type = base.getUrlParam('type') || "";
    var startDatetime = base.getUrlParam('sDate') || "";
    
	 var config = {
        start: 1,
        limit: 10,
        type: type,
        name: searchVal,
        placeDestCity: placeDestCity,
        startDatetimeStart: startDatetime
    }, isEnd = false, canScrolling = false;
    
    var _actTmpl = __inline('../../ui/activity-list-item.handlebars');
    
    var first1 = []; /* 省，直辖市 */
	var second1 = []; /* 市 */
	var selectedIndex1 = [0, 0, 0]; /* 默认选中的地区 */
	var checked1 = [0, 0, 0]; /* 已选选项 */
    
    
    init();

	function init(){
        Foot.addFoot(2);
		base.showLoading();
    	searchVal&&$("#search .searchText").val(searchVal)
    	placeDestCity&&$("#cityWrap").find("samp").text(placeDestCity);
    	if(placeDestCity){
    		$("#resetCity").removeClass("hidden")
    	}
    	startDatetime&&$("#startDatetime").text(startDatetime)
    	startDatetime&&$("#startDatetimeVal").text(startDatetime)
    	
    	//选择目的地
		getPicker($("#cityWrap"),{ 'first':[], 'second':[], 'selectedIndex':selectedIndex1, 'checked':checked1 },function(prv,city){
			placeDestCity = city
			filter();
		});
    	
		//获取类型数据字典
		GeneralCtr.getDictList({parentKey:'act_type'},'801907').then((data)=>{
			var html = ""
    		data.forEach(function(d, i){
    			html+=`<option value="${d.dkey}">${d.dvalue}</option>`
    		})
    		$("#type").append(html);
    		type&& $("#type").val(type)
    		
			getPageActivity();
		},base.hideLoading);
		
		addListener()
	}
	
	//分页查询活动
    function getPageActivity(refresh) {
        return ActivityStr.getPageActivity(config, refresh).then((data) => {
            var lists = data.list;
            var totalCount = +data.totalCount;
            if (totalCount <= config.limit || lists.length < config.limit) {
                isEnd = true;
            } else {
                isEnd = false;
            }
            if(data.list.length) {
                $("#content")[refresh || config.start == 1 ? "html" : "append"](_actTmpl({items: lists}));
                isEnd && $("#loadAll").removeClass("hidden");
                config.start++;
            } else if(config.start == 1) {
                $("#content").html('<div class="no-data-img"><img src="/static/images/no-data.png"/><p>暂未发布活动</p></div>');
                $("#loadAll").addClass("hidden");
            } else {
                $("#loadAll").removeClass("hidden");
            }
            !isEnd && $("#loadAll").addClass("hidden");
            canScrolling = true;
            base.hideLoading()
        }, () => base.hideLoading());
    }
    
    //筛选
    function filter(){
    	location.replace('./activity-list.html?searchVal='+searchVal+"&city="+placeDestCity+"&type="+type+"&sDate="+startDatetime)
    }
    
	function addListener(){
		
        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                getPageActivity();
            }
        });
		
        var start = {
            elem: '#startDatetime',
            format: 'YYYY-MM-DD',
            isclear: true, //是否显示清空
            istoday: false,
            choose: function(datas) {
            	var d = new Date(datas);
                d.setDate(d.getDate());
                d = d.format('yyyy-MM-dd');
                
                datas?startDatetime = d: startDatetime = '';
                filter();
            }
        };
        
        setTimeout(function(){
        	laydate(start);
        },0)
		
		//返回顶部
        $("#goTop").click(function(){
            var speed=200;//滑动的速度
            $('body,html').animate({ scrollTop: 0 }, speed);
            return false;
        })
        
        //类型
        $("#type").change(function(){
        	
        	type = $(this).val();
        	filter();
        })
        
        //搜索
		$("#search .searchText").focus(function(){
    		$(document).keyup(function(event){
				if(event.keyCode==13){
					if($("#search .searchText").val()&&$("#search .searchText").val()!=''){
						
						searchVal = $("#search .searchText").val();
        				filter();
					}
				}
			}); 
    	})
    	$("#search .searchText").blur(function(){
			if (window.event.keyCode==13){
				window.event.keyCode=0;
			}
    	})
    	
    	//一键报名
        $("#content").on("click", ".activity-item .joinInBtn", function(){
        	location.href="../activity/activity-detail.html?code="+$(this).attr("data-code")+"&isBtn=1"
        })
    	
    	//清除选择目的地
    	$("#resetCity").click(function(){
    		placeDestCity = ''
			filter();
        })
    	
	}
	
	//省市区选择
	function getPicker(cityWrap,param,successFun){
		var _nameEl = cityWrap;
		var first = param.first,
    		second = param.second,
    		selectedIndex = param.selectedIndex, 
    		checked = param.checked;
		
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
		
		var picker = new Picker({
			data: [first, second],
			selectedIndex: selectedIndex,
			title: '目的地'
		});
		
		picker.on('picker.select', function (selectedVal, selectedIndex) {
			var text1 = first[selectedIndex[0]].text;
			var text2 = second[selectedIndex[1]].text;
			
			successFun&&successFun(text1,text2);
			
		});
		
		picker.on('picker.change', function (index, selectedIndex) {
		  if (index === 0){
		    firstChange();
		  }
		
			function firstChange() {
			    second = [];
			    checked[0] = selectedIndex;
			    var firstCity = city[selectedIndex];
			    if (firstCity.hasOwnProperty('sub')) {
			      creatList(firstCity.sub, second);
			    } else {
			      second = [{text: '', value: 0}];
			      checked[1] = 0;
			    }
			
			    picker.refillColumn(1, second);
			    picker.scrollColumn(1, 0)
			}
			
		});
		
		picker.on('picker.valuechange', function (selectedVal, selectedIndex) {
		});
		
		_nameEl.on('click', function () {
			picker.show();
		});
	}
	
})
