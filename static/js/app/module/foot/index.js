define([
    'jquery'
], function ($) {
    var tmpl = __inline("index.html");
    var activeImgs = [
        __uri('../../../../images/home1.png'),
        __uri('../../../../images/course1.png'),
        __uri('../../../../images/tuijian1.png'),
        __uri('../../../../images/mine1.png')
    ];

    return {
        addFoot: function (idx) {
            var temp = $(tmpl);
            idx == undefined ? temp.appendTo($("body")) :
                temp.find("a:eq(" + idx + ")")
                    .addClass("active")
                    .find("img").attr("src", activeImgs[idx])
                    .end().end()
                    .appendTo($("body"));
        }
    }
});
