define(['Handlebars'], function(Handlebars) {
    Handlebars.registerHelper('formatMoney', function(num, options) {
        if (!num && num !== 0)
            return "--";
        num = +num / 1000;
        num = (num + "").replace(/^(\d+\.\d\d)\d*/i, "$1");
        return (+ num).toFixed(2);
    });
    Handlebars.registerHelper('formatImage', function(pic, options) {
        if (!pic)
            return "";
        pic = pic.split(/\|\|/)[0];
        if (/^http/.test(pic)) {
            return pic;
        }
        return PIC_PREFIX + pic;
    });
    Handlebars.registerHelper('formatSquareImage', function(pic, options) {
        if (!pic)
            return "";
        pic = pic.split(/\|\|/)[0];
        if (/^http/.test(pic)) {
            return pic;
        }
        return PIC_PREFIX + pic + "?imageMogr2/auto-orient/thumbnail/!200x200r";
    });
    Handlebars.registerHelper('formatRectImage', function(pic, options) {
        if (!pic)
            return "";
        pic = pic.split(/\|\|/)[0];
        if (/^http/.test(pic)) {
            return pic;
        }
        return PIC_PREFIX + pic + "?imageMogr2/auto-orient/thumbnail/!150x113r";
    });
    Handlebars.registerHelper('formatBigRectImage', function(pic, options) {
        if (!pic)
            return "";
        pic = pic.split(/\|\|/)[0];
        if (/^http/.test(pic)) {
            return pic;
        }
        return PIC_PREFIX + pic + "?imageMogr2/auto-orient/thumbnail/!400x116r";
    });
    Handlebars.registerHelper('formatAvatar', function(pic, options) {
        if (!pic) {
            return '/static/images/avatar.png';
        }
        pic = pic.split(/\|\|/)[0];
        if (/^http/.test(pic)) {
            return pic;
        }
        return PIC_PREFIX + pic + "?imageMogr2/auto-orient/thumbnail/!200x200r";
    });
    Handlebars.registerHelper('formatDateTime', function(date, options) {
        if (!date)
            return "--";
        return new Date(date).format("yyyy-MM-dd hh:mm:ss");
    });
    Handlebars.registerHelper('formatDateTime1', function(date, options) {
        if (!date)
            return "--";
        return new Date(date).format("yyyy-MM-dd hh:mm");
    });
    Handlebars.registerHelper('formatDate', function(date, options) {
        if (!date)
            return "--";
        return new Date(date).format("yyyy-MM-dd");
    });
    Handlebars.registerHelper('formateTime', function(date, options) {
        if (!date)
            return "--";
        return new Date(date).format("hh:mm");
    });
    Handlebars.registerHelper('clearTag', function(des, options) {
        return des && des.replace(/<[^>]+>|<\/[^>]+>|<[^>]+\/>|&nbsp;/ig, "") || "";
    });
    Handlebars.registerHelper('safeString', function(text, options) {
        return new Handlebars.SafeString(text);
    });
    Handlebars.registerHelper('formatAddress', function(val, options) {
        var data = options.data.root.items[options.data.index];
        if(data.city == data.province) {
            data.city = "";
        }
        return (data.province || "") + (data.city || "") + (data.area || "") + data.address;
    });

    return Handlebars;
});
