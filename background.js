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
	if(isMustShow(issue) == false){return}	
	var opt = {}
	opt.type = "basic"
	opt.title = '#'+issue.id+' '+issue.subject.toString()+'('+issue.project['name']+')'
	opt.message = ""
	opt.buttons = [{title:'Open',iconUrl:''}]
//	opt.contextMessage:'',
//		icon from manifest.json
	opt.iconUrl = chrome.app.getDetails().icons[48]

//	var body = ''
    opt.message += 'Author: '+issue.author['name']
    opt.message += '\nStatus: '+issue.status['name']
	if (issue.assigned_to) {
    	opt.message += '\nAssigned: '+issue.assigned_to['name']	
  	}
    opt.message += '\nUpdated: '+ new Date(issue.updated_on).toLocaleString()	

	chrome.notifications.create(
		issue.id.toString(), 
		opt ,
		function(){}
	) 
}
//=================== filter =======================
function valuesFromIssue(issue){
	var values = {'project':issue.project.name,
	   			'tracker':  issue.tracker.name,
			//	'id':       issue.id.toString(),
			//	'subject':  issue.subject,
				'status':   issue.status.name,
				'author':   issue.author.name,
			//	'description':issue.description,
			//	'updated_on': new Date(issue.updated_on).toLocaleString(),
			//	'created_on': new Date(issue.created_on).toLocaleString(),
				'assigned_to':'',
				};
	if (issue.assigned_to){
	    values['assigned_to'] = issue.assigned_to.name
	};
	return values
}

function isFilteredBy(filter_name, filtering_value){
	if ( localStorage[filter_name]){
		filter_words = localStorage[filter_name].toLowerCase().split(',');
		return filter_words.some(function(word){
			return (filtering_value.toLowerCase().search(word.trim()) > -1 && word.trim().length>0);
		})
	}
	return true
}

function isMustShow(issue){
	var filters = valuesFromIssue(issue)
	for (filter_name in filters){
		if(!isFilteredBy(filter_name, filters[filter_name])){
			return false
		}
	}
	return true
}
//============================================================
// Check that object a is in list of object b
function isContains(a,b){
	for (var i = 0, l = b.length; i < l; i++){
		if (a.id == b[i].id&&a.updated_on==b[i].updated_on){
			return true
		}
	};
	return false;
}
//-------------------------------------------------------
// Find difference for list:new_issue and list:old_issue
function findNew(new_list, old_list){
	
	var result = []
	for (var i = 0, l = new_list.length; i < l; i++){
		if (isContains(new_list[i],old_list) == false){
			result.push(new_list[i])
		}
	}
	return result
}
//---------------------------------------------------------

var issues = new Object()
issues.all = []
issues.redmine_url = localStorage["url"]

// Show all new issues and refresh issues.all
issues.showNew = function(fresh_issues){
	if (this.redmine_url != localStorage["url"]){
		this.redmine_url = localStorage["url"];
		this.all = fresh_issues;
		return
	}
	if (this.all.length != 0){ 
		var new_issues = findNew(fresh_issues, this.all);
		for (var i = 0, l = new_issues.length; i < l; i++){
			showNotification(new_issues[i]);
		};
	};
	this.all = fresh_issues;
}
// Download new issues and show all new.
issues.getNewAndShow = function(){
	if (!localStorage["url"]) {
		//alertNotification('You must fill URL field in settings');
		return
	};

	var request_get = {};
    request_get.url = localStorage["url"];
    request_get.dataType = "json";
    request_get.success = function(json){ issues.showNew(json.issues) };
    
    httpGet(request_get);
//    $.ajax(request_get).fail(function(){
//    	alertNotification('Can\'t connect to '+request_get.url)
//    });	       	
}

issues.getNewAndShow()
setInterval(function(){issues.getNewAndShow()},60000);

//http://xmlhttprequest.ru/
//http://learn.javascript.ru/json
function httpGet(request){
	var xmlhttp = new XMLHttpRequest()
	xmlhttp.open("GET",request.url,true);
	xmlhttp.send(null);
	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState != 4){ return }

		if(xmlhttp.status == 200) {
			try{
				json = JSON.parse(xmlhttp.responseText);
			}catch(err){
				alertNotification("Error description: " + err.message)	
			}
			if (json){ request.success(json) }
		}else{
			alertNotification("Can't connect to server")
		}


	}
}