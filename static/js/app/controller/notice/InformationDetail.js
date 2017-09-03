define([
  'app/controller/base',
  'app/interface/GeneralCtr',
], function(base, GeneralCtr) {
	var code = base.getUrlParam('code')

  init();

  function init() {
    getInformationDetail(code);
    addListener();
  }

  function getInformationDetail(c) {
    base.showLoading();
    GeneralCtr.getInformationDetail(c)
      .then(function(data) {
        base.hideLoading();
        var html = '';
        
        html=`<div class="info-pic" style="background-image: url('${base.getImg(data.pic)}');">
        		<div class="info-tit"><p>${data.title}</p></div></div>
        		<div class="info-content">${data.content}</div>`
        
        $("#content").html(html)
        
      }, base.hideLoading());
  }

  function addListener() {
  }
});
