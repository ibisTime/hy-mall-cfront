define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        //发布游记
        addTravelNotes(config) {
            return Ajax.post("801050", {
            	publisher: base.getUserId(),
                ...config	
            });
        },
        //修改游记
        editTravelNotes(config) {
            return Ajax.post("801052", {
            	publisher: base.getUserId(),
                ...config
            });
        },
        //分页查询游记
        getPageTravelNotes(config, refresh){
            return Ajax.get("801057", {
            	userId: base.getUserId(),
                ...config
            }, refresh);
        },
        //分页查询我的游记
        getPageMyTravelNotes(config, refresh){
            return Ajax.get("801058", {
            	userId: base.getUserId(),
                ...config
            }, refresh);
        },
        //点赞
        likeTravelNotes(code){
        	return Ajax.get("801061", {
        		travelCode:code,
        		userId: base.getUserId()
        	}, true);
        },
        //打赏
        dsTravelNotes(config){
        	return Ajax.get("801060", {
        		userId: base.getUserId(),
        		...config
        	}, true);
        },
        //查询游记详情
        getTravelNotesDetail(code){
            return Ajax.get("801056", {
            	code,
            	userId: base.getUserId(),
            }, true);
        },
        //分页查询游记评论
        getPageTravelNotesComment(config, refresh){
            return Ajax.get("801027", config, refresh);
        },
        //评论游记
        travelNotesComment(config, refresh){
            return Ajax.get("801062", {
        		userId: base.getUserId(),
        		...config
            },refresh);
        },
        //删除我的游记
        deleteMyTravelNotes(code){
        	return Ajax.get("801051", {
        		code
        	}, true);
        },
        
    };
})
