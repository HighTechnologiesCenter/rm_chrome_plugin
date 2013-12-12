//http://developer.chrome.com/extensions/declare_permissions.html
// Make button on Notification clickable  
chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
	var server_url = localStorage["url"].split('.json')[0]
	chrome.tabs.create({url: server_url+'/'+notificationId})
}
)
// notification for errors
function alertNotification(message){
	var notification = webkitNotifications.createNotification('','Warning',message);
	notification.show();
	setTimeout(function(){notification.cancel()}, 5000)
}

//notification for new issue
function showNotification(issue){
// http://developer.chrome.com/extensions/notifications.html	
	opt = {}
	opt.type = "basic"
	opt.title = '#'+issue.id+' '+issue.subject.toString()+'('+issue.project['name']+')'
	opt.message = ""
	opt.buttons = [{title:'Open',iconUrl:''}]
//	opt.contextMessage:'',
//		icon from manifest.json
	opt.iconUrl = chrome.app.getDetails().icons[48]

//	var body = ''
	if (issue.author) {
    opt.message += 'Author: '+issue.author['name']
  	}
	if (issue.status) {
    opt.message += '\nStatus: '+issue.status['name']
  	}
	if (issue.assigned_to) {
    opt.message += '\nAssigned: '+issue.assigned_to['name']	
  	}
	if (issue.updated_on) {
    opt.message += '\nUpdated: '+ new Date(issue.updated_on).toLocaleString()	
  	}

	notification = chrome.notifications.create(
		issue.id.toString(), 
		opt ,
		function(){
// :: delete showed notification
		//	setTimeout(function(){
		//		chrome.notifications.clear(
		//			issue.id.toString(),
		//			function(){}
		//		)},
		//		10000
		//	)
			
		}
	) 


}
//============================================================
// Check that object a is in list of object b
function utensils(a,b){
	for (var i = 0, l = b.length; i < l; i++){
		if (a.id == b[i].id&&a.updated_on==b[i].updated_on){
			return true
		}
	};
	return false;
}
//-------------------------------------------------------
// Find difference for list:new_issue and list:old_issue
function findNew(new_issue, old_issue){
	
	var result = []
	for (var i = 0, l = new_issue.length; i < l; i++){
		if (utensils(new_issue[i],old_issue)== false){
			result.push(new_issue[i])
		}
	}
	return result
}
//---------------------------------------------------------

issues = new Object()
issues.all = []
issues.redmine_url = localStorage["url"]

// check that settings(url) is changed
issues.isUrlChanged = function(){
	if (this.redmine_url != localStorage["url"]){
		this.redmine_url = localStorage["url"]
		return true
		
	}
	return false
}
// Show all new issues and refresh issues.all
issues.showNew = function(fresh_issues){
	if (this.all.length != 0||this.isUrlChanged == false ){ 
		var new_issues = findNew(fresh_issues.issues, this.all);
		for (var i = 0, l = new_issues.length; i < l; i++){
			showNotification(new_issues[i]);
		};
	};
	this.all = fresh_issues.issues;
}
// Download new issues and show all new.
issues.getNewAndShow = function(){
	if (!this.redmine_url&&this.isUrlChanged == false) {
		alertNotification('You must fill URL field in settings');
		return
	};
    var request_get = {};
    request_get.url = this.redmine_url;
    request_get.dataType = "json";
    request_get.success = function(json){ issues.showNew(json) };
    
    $.ajax(request_get).fail(function(){
    	alertNotification('Can\'t connect to '+this.redmine_url)
    });	       	

}

issues.getNewAndShow()
setInterval(function(){issues.getNewAndShow()},60000);

//--------------------------------------------------
// pattern: 'some string {{variable_name}} some string'
// values: {variable_name:variable value}
function formatString(pattern, values){
	var split_pattern = pattern.split('}}');
	var result = '';
	for(i = 0,l=split_pattern.length-1; i<l; i++){
		var parts = split_pattern[i].split('{{')
		if(values[parts[1]]){
			result += parts[0] + values[parts[1]]
		}else{
			result += parts[0]
		};
	};
	result += split_pattern[split_pattern.length-1];
	return result
}
