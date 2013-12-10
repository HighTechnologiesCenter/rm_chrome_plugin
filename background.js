//http://developer.chrome.com/extensions/declare_permissions.html
//notification about errors
function alertNotification(message){
	var notification = webkitNotifications.createNotification('','Warning',message);
	notification.show();
	setTimeout(function(){notification.cancel()}, 2000)
}

//notification about new issue
function showNotification(issue){
// http://developer.chrome.com/extensions/notifications.html	
	opt = {
		type: "basic",
		title: '#'+issue.id+' '+issue.subject.toString()+'('+issue.project['name']+')',
		message: "",
		buttons:[{title:'Open',iconUrl:''}],
//		contextMessage:'',
//		get icon from manifest.json
		iconUrl: chrome.app.getDetails().icons[48],
	}

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
//-------------------------------------------------------
function refresh() {
	var redmine_url = localStorage["url"];
	if (!redmine_url) {
		alertNotification('You must fill URL field in settings');
		return
	};
	// get issue list, compare old and new list, show notification
    $.ajax({
        url:redmine_url,
        dataType:"json",
        success: function (json) {
        	if (temp_issues.length != 0){
           		var new_issues = findNew(json.issues, temp_issues);

	        	for (var i = 0, l = new_issues.length; i < l; i++){
	            	showNotification(new_issues[i]);
	            };
			};
	       	temp_issues = json.issues;

        }
    }).fail(function(){
    	alert('Can\'t connect to '+redmine_url)
    });
}
//-------------------------------------------------------------------
var temp_issues = []
chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
	var server_url = localStorage["url"].split('.json')[0]
	chrome.tabs.create({url: server_url+'/'+notificationId})
}
)
refresh();
setInterval(function(){refresh()},60000);

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
