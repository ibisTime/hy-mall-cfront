define([
    'app/controller/base',
    'app/interface/MallCtr',
    'app/interface/LeaseCtr'
], function(base, MallCtr, LeaseCtr) {
	const MALL_ORDER = "mall",LEASE_ORDER = "lease";
	var code = base.getUrlParam("code"),
		type = base.getUrlParam("type");

    init();
    
    function init(){
        if(type==MALL_ORDER){
        	getMallOrderDetail()
        }else if(type==LEASE_ORDER){
        	getLeaseOrderDetail();
        }
        addListener();
    }
    
    //获取商城订单详情
    function getMallOrderDetail() {
        MallCtr.getOrderDetail(code, true)
            .then((data) => {
                base.hideLoading();
				var html = "";
                data.productOrderList.forEach((item) => {
                    html += buildHtmlMall(item);
                });
                
                $('#content').html(html)
            });
    }
    
    //获取租赁订单详情
    function getLeaseOrderDetail() {
        LeaseCtr.getOrderDetail(code, true)
            .then((data) => {
                base.hideLoading();
				var html = "";
                    html = buildHtmlLease(data);
                
                $('#content').html(html)
            });
    }
    
    function commentOrderMall(param){
    	base.showLoading();
    	MallCtr.commentOrder(param).then((data) => {
	            base.hideLoading();
	            base.showMsg('评论成功',1000)
	            
	        	setTimeout(function(){
	        		location.href='./mall-orders.html'
	        	},800)
	            
	        },()=>{})
    	
    }
    
    function commentOrderLease(param){
    	base.showLoading();
    	LeaseCtr.commentOrder(param).then((data) => {
            base.hideLoading();
            base.showMsg('评论成功',1000)
            
        	setTimeout(function(){
        		location.href='./lease-orders.html'
        	},800)
            
        },()=>{})
    	
    }
    
    function buildHtmlMall(item){
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
    
    function buildHtmlLease(item){
    	return `<div class="comment-item" data-productCode="${item.rproduct.code}">
					<div class="comment-header">
						<div class="fl pic" style="background-image: url('${base.getImg(item.rproduct.advPic)}');"></div>
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
		        if(type==MALL_ORDER){
		        	commentOrderMall(param)
		        }else if(type==LEASE_ORDER){
		        	commentOrderLease(param)
		        }
    			
    		}
    	})
    }
});
