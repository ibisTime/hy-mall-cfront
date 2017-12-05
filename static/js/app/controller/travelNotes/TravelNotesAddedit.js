define([
    'app/controller/base',
	'app/module/validate',
    'app/interface/TravelNotesStr',
], function(base, Validate, TravelNotesStr) {
	
    init();

	function init(){
        addListener();
	}
	
	//发布游记
	function addTravelNotes(params){
		TravelNotesStr.addTravelNotes(params).then(()=>{
			base.showMsg("发布成功")
		},()=>{})
	}
	
	function addListener(){
		var _tNotesForm = $("#tNotesForm");
	    _tNotesForm.validate({
	    	'rules': {
	        	"description": {
	        		required: true
	        	},
	    	},
	    	onkeyup: false
	    });
	    
	    $("#subBtn").click(function(){
	    	if (_tNotesForm.valid()) {
	    		var pic='';
	    		
      			$("#picWrap").find('.pic').each(function(i, d){
      				pic+=$(this).attr("data-url")
      				
      				if(i<$("#picWrap").find('.pic').length-1){
      					pic+='|';
      				}
      			})
      			
	    		var params={
	    			description:$("#description").val(),
	    			pic:pic
	    		}
	    		addTravelNotes(params)
	    		
		    }
	    })
	    
	}
})
