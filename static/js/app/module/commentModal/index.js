define([
    'jquery'
], function ($) {
    var tmpl = __inline("index.html");
    var css = __inline("index.scss");
    var defaultOption = {};

    $("head").append('<style>'+css+'</style>');
    function _hasContent() {
        return !!$("#_commentModalWrapper").length;
    }
    const commentModal = {
        addCont: function(){
            if(!_hasContent()){
                var cont = $(tmpl);
                $("body").append(cont);
                cont.find(".close-button").on("click", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    commentModal.hideCont();
                });
            }
            return this;
        },
        showCont: function(data){
            if(_hasContent()){
                var html = "";
                data.itemScoreList.forEach((item) => {
                    var score = Math.floor(item.score),
                        reScore = 5 - score;
                    var _html = "";
                    while(score--) {
                        _html += `<i class="hot-star active"></i>`;
                    }
                    while (reScore--) {
                        _html += `<i class="hot-star"></i>`;
                    }
                    html += `<div class="assessment-item">
                        <div class="am-flexbox">
                            <div class="assessment-title">${item.name}</div>
                            <div class="assessment-content">${_html}</div>
                        </div>
                    </div>`;
                });
                $("#_commentModalWrapper").find(".assessment-wrap").html(html)
                    .end().find(".assessment-text").html(data.content)
                    .end().show();
            }
            return this;
        },
        hideCont: function(){
            $("#_commentModalWrapper").hide();
            return this;
        }
    };
    return commentModal;
});
