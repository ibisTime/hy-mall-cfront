define([
  'app/controller/base',
  'app/interface/GeneralCtr',
    'app/module/weixin',
], function(base, GeneralCtr, weixin) {
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
        
        //微信分享
        weixin.initShare({
            title: data.title,
            desc: base.clearTag(data.content),
            link: location.href,
            imgUrl: base.getImg(data.pic)
        });
        
			$('title').html(data.title+'-资讯详情');
        
        var html = '';
        
        html=`<div class="info-pic" style="background-image: url('${base.getImg(data.advPic,'?imageMogr2/auto-orient/thumbnail/!750x430')}');"></div>
        		<div class="info-tit">
        			<p>${data.title}</p>
    				</div>
    				<div class="info-time">
    					<samp>${base.formatDate(data.updateDatetime,'yyyy-MM-dd hh:mm:ss')}</samp>
    					<samp class="infoCollect ${data.isCollect=='1'?'active':''}" id="collect">${data.isCollect=='1'?'取消收藏':'收藏'}</samp>
    				</div>
        		<div class="info-content">${data.content}</div>`;
        
        $("#content").html(html)
        
      }, base.hideLoading());
  }
	
	//收藏
	function addCollecte(c){
		base.showLoading();
		GeneralCtr.addCollecte(c,'N').then(()=>{
			
			getInformationDetail(c);
			base.hideLoading();
		},()=>{
			base.hideLoading();
		})
	}
	
	//取消收藏
	function cancelCollecte(c){
		base.showLoading();
		GeneralCtr.cancelCollecte(c,'N').then(()=>{
			getInformationDetail(c);
			
			base.hideLoading();
		},()=>{
			base.hideLoading();
		})
	}
	
  function addListener() {
  	
		//收藏
		$("#content").on('click','#collect',function(){
			
			if($(this).hasClass('active')){
				cancelCollecte(code)
			}else{
				addCollecte(code)
			}
		})
  	
  }
});
