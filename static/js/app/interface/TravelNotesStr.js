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
        editBankCard(config) {
            return Ajax.post("802012", {
                status: 1,
                ...config
            });
        },
    };
})
