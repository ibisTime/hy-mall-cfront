define([
    'app/controller/base',
    'app/module/foot',
    'app/module/weixin',
    'app/interface/GeneralCtr'
], function(base, Foot, weixin, GeneralCtr) {

    init();
    function init(){
        Foot.addFoot(2);
        getRate();
        calculate();
        createQRCode();
        weixin.initShare({
            title: document.title,
            desc: "自玩自健",
            link: location.href,
            imgUrl: base.getShareImg()
        });
    }
    function createQRCode() {
        var qrCode = new QRCode('qrCode');
        qrCode.makeCode(location.origin + '/user/redirect.html?userReferee=' + base.getUserId());
    }
    // 获取违约金比率
    function getRate() {
        return GeneralCtr.getBizSysConfig("HKFC")
            .then((data) => {
                $("#rate").text(+data.cvalue * 100 + "%");
            });
    }
    function calculate() {
        var winHeight = window.innerHeight - $(".global-footer").outerHeight(),
            winWidth = window.innerWidth;
        var imgWidth = (330 / 750) * winWidth,
            imgHeight = (330 / 1206) * winHeight,
            imgTop = (257 / 1206) * winHeight;
        $("#qrCode").css({
            width: imgWidth + "px",
            height: imgHeight + "px",
            top: imgTop + "px"
        });
        var noteTop = (800 / 1206) * winHeight;
        $("#activeNote").css({
            width: imgWidth + "px",
            top: noteTop + "px"
        });
        var descTop = noteTop + 30,
            descWidth = (580 / 750) * winWidth;
        $("#desc").css({
            top: descTop + "px",
            width: descWidth + "px"
        });
        var titleTop = (130 / 1206) * winHeight;
        $("#title").css("top", titleTop + "px");

    }
});
