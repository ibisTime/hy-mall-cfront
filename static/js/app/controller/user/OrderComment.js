define([
    'app/controller/base',
    'app/interface/MallCtr'
], function(base, MallCtr) {
	var code = base.getUrlParam("code");

    init();
    
    function init(){
        addListener();
        getOrderDetail();
    }
    
    //获取订单详情
    function getOrderDetail() {
        MallCtr.getOrderDetail(code, true)
            .then((data) => {
                base.hideLoading();
				var html = "";
                data.productOrderList.forEach((item) => {
                    html += buildHtml(item);
                });
                
                $('#content').html(html)
            });
    }
    
    function commentOrder(param){
    	base.showLoading();
    	MallCtr.commentOrder(param).then((data) => {
            base.hideLoading();
            base.showMsg('评论成功',1000)
            
        	setTimeout(function(){
        		location.href='./mall-orders.html'
        	},800)
            
        })
    }
    
    function buildHtml(item){
    	return `<div class="comment-item" data-productCode="${item.productCode}">
					<div class="comment-header">
						<div class="fl pic" style="background-image: url('${base.getImg(item.product.advPic)}');"></div>
						<div class="fl comment-star">
							<samp class="fl">评价</samp>
							<div class="starWrap fl" data-score='5'>
								<i data-txt = "非常差" class="star active"></i>
								<i data-txt = "差" class="star active"></i>
								<i data-txt = "一般" class="star active"></i>
								<i data-txt = "好" class="star active"></i>
								<i data-txt = "非常好" class="star active"></i>
							</div>
							<span class="txt">非常好</span>
						</div>
					</div>
					<textarea style="resize: none;" class="comment-content" placeholder="宝贝满足你的期待吗？说说他的优点与美中不足的地方吧"></textarea>
				</div>`;
    }
    
    

    function addListener(){
    	$("#content").on('click', '.comment-item .starWrap .star', function(){
    		var _this = $(this);
    		var score = 1;
    		var _starWrap = _this.parent('.starWrap');
    		var _thisIndex = _this.index()
    		
    		_starWrap.children('.star').removeClass('active')
    		_starWrap.children('.star').each(function(i, d){
    			if(i<=_thisIndex){
    				score = i+1;
    				$(this).addClass('active')
    			}
    		})
    		_starWrap.attr('data-score', score);
    		_starWrap.siblings('.txt').html(_this.attr('data-txt'))
    	})
    	
    	//发表评论
    	$("#subBtn").click(function(){
    		var param ={
    			orderCode: code,
    			commentList:[],
    		}
    		var flag = true;
    		$("#content .comment-item").each(function(i, d){
    			var _this = $(this);
    			
    			if(_this.find('.comment-content').val()){
    				
	    			var tmpl = {
	    				productCode: _this.attr('data-productCode'),
	    				score: _this.find('.starWrap').attr('data-score'),
	    				content: _this.find('.comment-content').val(),
	    			}
	    			
    				_this.find('.comment-content').removeClass('error');
	    			param.commentList.push(tmpl)
    			}else{
    				flag = false;
    				_this.find('.comment-content').addClass('error');
    				base.showMsg('请输入评论内容!')
    				return false;
    			}
    		})
    		
    		if(flag){
    			commentOrder(param)
    		}
    	})
    }
});
