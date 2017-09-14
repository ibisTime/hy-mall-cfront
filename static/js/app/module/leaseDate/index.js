/**
 * 日历日期选择
 * @源：http://www.jq22.com/jquery-info14585
 * @改：2017.9.12
 */
(function($) {
	"use strict";
	var calendarSwitch = (function() {
		function calendarSwitch(element, options) {
			this.settings = $.extend(true, $.fn.calendarSwitch.defaults, options || {});
			this.element = element;
			this.init();
		}
		calendarSwitch.prototype = {
			/*说明：初始化插件*/
			/*实现：初始化dom结构，布局，分页及绑定事件*/
			init: function() {
				var me = this;
				me.selectors = me.settings.selectors;
				me.sections = me.selectors.sections;
				me.index = me.settings.index;
				me.comfire = me.settings.comfireBtn;
				me.title = me.settings.title;
				me.minDays = me.settings.minDays;

				var html = "<div class='headerWrapper'><div class='headerTip'>" + me.title + "</div><div class='comfire'>确定</div></div><table class='dateZone'><tr><td class='colo'>日</td><td>一</td><td>二</td><td>三</td><td>四</td><td>五</td><td class='colo'>六</td></tr></table>" +
					"<div id='tbody' class='tbody'></div>"
				$(me.sections).append(html);
				$(me.sections).find('.headerWrapper').css({
					"height": "1rem",
					"line-height": "1rem",
					"position": "relative"
				});
				$(me.sections).find('.headerTip').css({
					"text-align": "center",
					"line-height": "1rem",
				});
				$(me.sections).find(me.comfire).css({
					"height": ".52rem",
					"line-height": ".52rem",
					"width": "1.1rem",
					"color": "#ff5400",
					"position": "absolute",
					"right": ".3rem",
					"text-align": "center",
					"font-size": ".26rem",
					"cursor": "pointer",
					"top": ".24rem",
					"border-radius": ".1rem",
					"border": "1px solid #ff5400"

				});
				for(var q = 0; q < me.index; q++) {
					var select = q;
					$("#tbody").append("<p class='ny1'></p><table class='dateTable'></table>")
					var currentDate = new Date();
					//                  console.log(currentDate)
					currentDate.setMonth(currentDate.getMonth() + select);
					//                  console.log(currentDate)
					var currentYear = currentDate.getFullYear();
					var currentMonth = currentDate.getMonth();
					var setcurrentDate = new Date(currentYear, currentMonth, 1);
					var firstDay = setcurrentDate.getDay();
					var yf = currentMonth + 1;
					if(yf < 10) {
						//                      console.log($(me.sections).find('.ny1').eq(select))
						$(me.sections).find('.ny1').eq(select).text(currentYear + '年' + '0' + yf + '月');
					} else {
						$(me.sections).find('.ny1').eq(select).text(currentYear + '年' + yf + '月');
					}
					if(me._isLeapYear(currentYear)) {
						var DaysInMonth = new Array(31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
					} else {
						var DaysInMonth = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
					}
					var Ntd = firstDay + DaysInMonth[currentMonth];
					var Ntr = Math.ceil(Ntd / 7);
					for(var i = 0; i < Ntr; i++) {
						console.log()
						$(me.sections).find('.dateTable').eq(select).append('<tr></tr>');
					};
					var createTd = $(me.sections).find('.dateTable').eq(select).find('tr');
					createTd.each(function(index, element) {
						for(var j = 0; j < 7; j++) {
							$(this).append('<td></td>')
						}
					});
					var arryTd = $(me.sections).find('.dateTable').eq(select).find('td');
					for(var m = 0; m < DaysInMonth[currentMonth]; m++) {
						arryTd.eq(firstDay++).text(m + 1);
					}
				}
				me._initselected();

				me.element.on('click', function(event) {
					event.preventDefault();
					me._slider(me.sections)
				});
				$(me.comfire).on('click', function(event) {
					event.preventDefault();
					var st = $('#startDate').html();
					var en = $('#endDate').html();
					var start,end;
					start=st.replace(/-/g,"/");
					var startdate=new Date(start);
					end=en.replace(/-/g,"/");
					var enddate=new Date(end);
				
					var time=enddate.getTime()-startdate.getTime();
					var days=parseInt(time/(1000 * 60 * 60 * 24))+1;
					
					if(days >= me.minDays){
						if(st) {
							me._slider(me.sections)
							me._callback(true);
	
						} else {
							var b = new Date();
							var ye = b.getFullYear();
							var mo = b.getMonth() + 1;
							var da = b.getDate();
							$('#startDate').html(ye + '-' + mo + '-' + da);
							
							//最小天数为1时
							if(me.minDays=='1'){
								
								$('#endDate').html(ye + '-' + mo + '-' + da);
							}else{
								
								b = new Date(b.getTime() + 24 * 3600 * 1000 * me.minDays);
								var ye = b.getFullYear();
								var mo = b.getMonth() + 1;
								var da = b.getDate();
								$('#endDate').html(ye + '-' + mo + '-' + da);
							}
	
							me._slider(me.sections)
							me._callback(true)
						}
					}else{
						me._callback(false)
					}

					/* Act on the event */
				});

			},
			_isLeapYear: function(year) {
				return(year % 4 == 0) && (year % 100 != 0 || year % 400 == 0);
			},
			_slider: function(id) {
				var me = this;
				me.animateFunction = me.settings.animateFunction;
				if(me.animateFunction == "fadeToggle") {
					$(id).fadeToggle();
				} else if(me.animateFunction == "slideToggle") {
					$(id).slideToggle();
				} else if(me.animateFunction == "toggle") {
					$(id).toggle();
				}

			},
			//初始选中
			_initselected: function() {
				var me = this;
				me.comeColor = me.settings.comeColor;
				me.outColor = me.settings.outColor;
				me.comeoutColor = me.settings.comeoutColor;
				me.daysnumber = me.settings.daysnumber;
				me.minDays = me.settings.minDays;

				var strDays = new Date().getDate()+1;
				var arry = [];
				var arry1 = [];
				var tds = $('.dateTable').eq(0).find('td');
				tds.each(function(index, element) {
					if($(this).text() == strDays) {
						var r = index;
						
						//最少天数为1时只选中开始时间
						if(me.minDays=='1'){
							$(this).append('</br><p class="rz">起/止</p>');
							$(this).css({
								'background': me.comeColor,
								'color': '#fff'
							});
						}else{
							$(this).append('</br><p class="rz">' + me.settings.startName + '</p>');
							if(tds.eq(index+me.minDays-1).text() != "") {
								tds.eq(index+me.minDays-1).append('</br><p class="rz">' + me.settings.endName + '</p>');
							} else {
								$(".dateTable").eq(1).find("td").each(function(index, el) {
									if($(this).text() != "") {
										$(".dateTable").eq(1).find("td").eq(index+me.minDays-1).append('</br><p class="rz">' + me.settings.endName + '</p>');
										return false;
									}
								});
							}
							
							me._checkColor(me.comeColor, me.outColor)
						}
						
						//开始到结束中间的选择颜色
						for(var i=index+1; i < index+me.minDays-1; i++) {
							tds.eq(i).css({
								'background': me.comeoutColor,
								'color': '#fff'
							});
							
						}
					}
					
				})

				$('#tbody').find('td').each(function(index, element) {
					if($(this).text() != '') {
						arry.push(element);
					}
				});
				for(var i = 0; i < strDays - 1; i++) {
					$(arry[i]).css('color', '#ccc');
				}
				if(me.daysnumber) {
					//可以在这里添加60天的条件
					for(var i = strDays - 1; i < strDays + 60; i++) {
						arry1.push(arry[i])
					}
					for(var i = strDays + 60; i < $(arry).length; i++) {
						$(arry[i]).css('color', '#ccc')
					}
				} else {
					for(var i = strDays - 1; i < $(arry).length; i++) {
						arry1.push(arry[i])
					}
				}
				me._selectDate(arry1)
			},
			// me._checkColor(,)
			_checkColor: function(comeColor, outColor) {
				var me = this;
				var rz = $(me.sections).find('.rz');
				//                                  console.log(rz);
				for(var i = 0; i < rz.length; i++) {
					if(rz.eq(i).text() == me.settings.startName) {
						rz.eq(i).closest('td').css({
							'background': comeColor,
							'color': '#fff'
						});
					} else if(outColor) {
						rz.eq(i).closest('td').css({
							'background': outColor,
							'color': '#fff'
						});
					}
				}

			},
			_callback: function(n) {//n true：起止日期相差天数大于或等于最少天数  false：起止日期相差天数少于最少天数
				var me = this;
				if(me.settings.callback && $.type(me.settings.callback) === "function") {
					me.settings.callback(n);
				}
			},
			_selectDate: function(arry1) {
				var me = this;
				me.comeColor = me.settings.comeColor;
				me.outColor = me.settings.outColor;
				me.comeoutColor = me.settings.comeoutColor;
				me.sections = me.selectors.sections;
				me.minDays = me.settings.minDays;

				var flag = 0;
				var first;
				var sum;
				var second;
				$(arry1).on('click', function(index) {
					//第一次点击
					if(flag == 0) {
						$('.hover').remove();
						$('#tbody').find('p').remove('.rz');
						$('#tbody').find('br').remove();
						$(arry1).css({
							'background': '#fff',
							'color': '#000'
						});
						// $(this).css({'background':'#09F','color':'#fff'});
						$(this).append('<p class="rz">' + me.settings.startName + '</p>')
						first = $(arry1).index($(this));
						//x1=$(this).next().offset().left;
						//y1=$(this).next().offset().top;

						if(me.minDays=='1'){
							//点击的日期存入input
							$('#tbody .rz').each(function(index, element) {
								if($(this).text() == me.settings.startName) {
									var day = parseInt($(this).parent().text().replace(/[^0-9]/ig, "")) //截取字符串中的数字
	
									var startDayArrays = $(this).parents('table').prev('p').text().split('');
									var startDayArrayYear = [];
									var startDayArrayMonth = [];
									var startDayYear = "";
									var startDayMonth = "";
									for(var i = 0; i < 4; i++) {
										var select = i;
										startDayArrayYear.push(startDayArrays[select])
									}
									startDayYear = startDayArrayYear.join('');
									for(var i = 5; i < 7; i++) {
										startDayArrayMonth.push(startDayArrays[i])
									}
									startDayMonth = startDayArrayMonth.join('');
									$('#startDate').html(startDayYear + '-' + startDayMonth + '-' + day)
									
									$('#endDate').html(startDayYear + '-' + startDayMonth + '-' + day);
								}
	
								startDayArrayYear = [];
								startDayArrayMonth = [];
	
							});
							var myweek = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
	
							var st = new Date($('#startDate').html());
							var en = new Date($('#endDate').html());
							$('.week').text(myweek[st.getDay()])
							$('.week1').text(myweek[en.getDay()])
						}
						
						me._checkColor(me.comeColor, me.outColor)
						flag = 1;
					}
					//第二次点击
					else if(flag == 1) {

						// $(this).css({'background':'#ff5400','color':'#fff'});
						flag = 0;
						second = $(arry1).index($(this))
						// x=$(this).next().offset().left;
						//           y=$(this).next().offset().top;
						sum = Math.abs(second - first);

						if(first < second) {
							$(this).append('<p class="rz">' + me.settings.endName + '</p>')
							first = first + 1;
							for(first; first < second; first++) {
								$(arry1[first]).css({
									'background': me.comeoutColor,
									'color': '#fff'
								});
							}
						} else if(first == second) {

							$('.rz').text(me.settings.endName);
							var e = $(this).text().replace(/[^0-9]/ig, "");
							var c, d;
							var a = new Array();
							var b = new Array();
							var f;
							var same = $(this).parents('table').prev('p').text().replace(/[^0-9]/ig, "").split('');
							for(var i = 0; i < 4; i++) {
								a.push(same[i]);

							}
							c = a.join('');
							for(var j = 4; j < 6; j++) {
								b.push(same[j]);
							}
							d = b.join('');

							f = c + '-' + d + '-' + e;
							$("#startDate").html(f);

						} else if(first > second) {

							$('.rz').text(me.settings.endName);
							$(this).append('<p class="rz">' + me.settings.startName + '</p>')
							// $(this).css({'background':'#09f','color':'#fff'});
							second = second + 1;
							for(second; second < first; second++) {
								$(arry1[second]).css({
									'background': me.comeoutColor,
									'color': '#fff'
								});
							}
						}
						$('.rz').each(function(index, element) {
							if($(this).text() == me.settings.endName) {
								// $(this).parent('td').next('td').append('<span class="hover">'+sum+'天</span>')
								// $(this).parent('td').next('td').css('position','relative');
							}
							if(sum == 0) {
								$('.hover').hide();
							}
						});
						//$('#tbody').append('<span class="hover">'+sum+'天</span>')
						//$('.hover').css({'position':'fixed','left':x,'top':y})刚开始用作定位的
						$('.hover').css({
							'position': 'absolute',
							'left': '-10px',
							'top': '0px'
						})
						me._slider('firstSelect')

						//点击的日期存入input
						$('#tbody .rz').each(function(index, element) {
							if($(this).text() == me.settings.startName) {
								var day = parseInt($(this).parent().text().replace(/[^0-9]/ig, "")) //截取字符串中的数字

								var startDayArrays = $(this).parents('table').prev('p').text().split('');
								var startDayArrayYear = [];
								var startDayArrayMonth = [];
								var startDayYear = "";
								var startDayMonth = "";
								for(var i = 0; i < 4; i++) {
									var select = i;
									startDayArrayYear.push(startDayArrays[select])
								}
								startDayYear = startDayArrayYear.join('');
								for(var i = 5; i < 7; i++) {
									startDayArrayMonth.push(startDayArrays[i])
								}
								startDayMonth = startDayArrayMonth.join('');
								$('#startDate').html(startDayYear + '-' + startDayMonth + '-' + day)
							}
							if($(this).text() == me.settings.endName) {
								var day = parseInt($(this).parent().text().replace(/[^0-9]/ig, ""));
								//day=$(this).parent().text().split('离')[0];

								var endDayArrays = $(this).parents('table').prev('p').text().split('');
								var endDayArrayYear = [];
								var endDayArrayMonth = [];
								var endDayYear = "";
								var endDayMonth = "";
								for(var i = 0; i < 4; i++) {
									endDayArrayYear.push(endDayArrays[i])
								}
								endDayYear = endDayArrayYear.join('');
								for(var i = 5; i < 7; i++) {
									endDayArrayMonth.push(endDayArrays[i])
								}
								endDayMonth = endDayArrayMonth.join('');

								$('#endDate').html(endDayYear + '-' + endDayMonth + '-' + day);
								if(parseInt($("#startDate").html().replace(/[^0-9]/ig, "")) == parseInt($("#endDate").html().replace(/[^0-9]/ig, ""))) {
									var x = $('#startDate').html();
									var a = new Date(x.replace(/-/g, "/"));
									var b = new Date();
									//b.setDate(a.getDate()+1)

									b = new Date(a.getTime() + 24 * 3600 * 1000);
									var ye = b.getFullYear();
									var mo = b.getMonth() + 1;
									var da = b.getDate();
									$('#endDate').html(ye + '-' + mo + '-' + da);
									$('.center_content').text('共1天')

								}

							}else if(me.settings.minDays == '1'){
								//最小为1天时 点击确定结束日期默认为开始时间
								var x = $('#startDate').html();
								$('#endDate').html(x);
							}
							startDayArrayYear = [];
							startDayArrayMonth = [];
							endDayArrayYear = [];
							endDayArrayMonth = [];

						});
						var myweek = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

						var st = new Date($('#startDate').html());
						var en = new Date($('#endDate').html());
						$('.week').text(myweek[st.getDay()])
						$('.week1').text(myweek[en.getDay()])
						me._checkColor(me.comeColor, me.outColor)

					}
					//第二次点击结束

				})
			}

		}
		return calendarSwitch;
	})();
	$.fn.calendarSwitch = function(options) {
		return this.each(function() {
			var me = $(this),
				instance = me.data("calendarSwitch");

			if(!instance) {
				me.data("calendarSwitch", (instance = new calendarSwitch(me, options)));
			}

			if($.type(options) === "string") return instance[options]();
		});
	};
	$.fn.calendarSwitch.defaults = {
		selectors: {
			sections: "#calendar"
		},
		index: 2, //展示的月份个数
		animateFunction: "toggle", //动画效果
		controlDay: false, //是否控制在daysnumber天之内，这个数值的设置前提是总显示天数大于90天
		daysnumber: "60", //控制天数
		comeColor: "blue", //颜色
		outColor: "red", //结束颜色
		comeoutColor: "#0cf", //开始和结束之间的颜色
		callback: "", //回调函数
		comfireBtn: '.comfire', //确定按钮的class或者id
		title: '请选择起止日期', //标题名称
		startName: '开始', //开始时间名称
		endName: '结束', //开始时间名称
		minDays:'1' //最小天数
	};
})(jQuery);