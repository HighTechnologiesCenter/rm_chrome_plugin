//http://developer.chrome.com/extensions/declare_permissions.html
// Make button on Notification clickable  
chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
	chrome.tabs.create({url: localStorage['hostname']+'/issues/'+notificationId})
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
   	opt.message += (issue.assigned_to) ? '\nAssigned: '+issue.assigned_to['name'] : ''
    opt.message += '\nUpdated: '+ new Date(issue.updated_on).toLocaleString()	

	chrome.notifications.create(
		issue.id.toString(), 
		opt ,
		function(){}
	) 
}
//=================== filter =======================
function isContainWordsFrom(comma_separated_words, filtering_value){
	if ( comma_separated_words ){
		words = comma_separated_words.toLowerCase().split(',');
		return words.some(function(word){
			return (filtering_value.toLowerCase().search(word.trim()) > -1 && word.trim().length>0);
		})
	}
	return true
}

function isShow(issue){
	if(localStorage['watch_issues']&&isContainWordsFrom(localStorage['watch_issues'], issue.id.toString())){
		return true
	}
	if(localStorage['watch_project']&&isContainWordsFrom(localStorage['watch_project'], issue.id.toString())){
		return true
	}
	var filters = {
		'project':  issue.project.name,
	   	'tracker':  issue.tracker.name,
		'status':   issue.status.name,
		'author':   issue.author.name,
		'assigned_to': (issue.assigned_to) ? issue.assigned_to.name : '',
	};

	for (filter_name in filters){
		if(!isContainWordsFrom(localStorage[filter_name], filters[filter_name])){
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
issues.redmine_url = urlFromlocalStorage(localStorage)

// Show all new issues and refresh issues.all
issues.showNew = function(downloaded_issues){
	//Checking for basic settings change
	if (this.redmine_url != urlFromlocalStorage(localStorage)){
		this.redmine_url = urlFromlocalStorage(localStorage);
		this.all = downloaded_issues;
		return
	}
	if (this.all.length != 0){ 
		var new_issues = findNew(downloaded_issues, this.all);
		for (var i = 0, l = new_issues.length; i < l; i++){
			if ( isShow(new_issues[i]) ){
				showNotification( new_issues[i] );
			}
		};
	};
	this.all = downloaded_issues;
}
// Download new issues and show all new.
issues.getNewAndShow = function(){
	if (!localStorage["hostname"]||!localStorage["key"]) {
		//alertNotification('You must fill URL field in settings');
		return
	};

	var request_get = {};
    request_get.url = urlFromlocalStorage(localStorage);
    request_get.dataType = "json";
    request_get.success = function(json){ issues.showNew(json.issues) };
    
    httpGet(request_get);
//    $.ajax(request_get).fail(function(){
//    	alertNotification('Can\'t connect to '+request_get.url)
//    });	       	
}

issues.getNewAndShow()
setInterval(function(){issues.getNewAndShow()},60000);

function urlFromlocalStorage(localStorage){
	var out = localStorage['hostname']+'/issues.json?sort=updated_on:desc';
	out += (localStorage['limit']) ? '&limit='+localStorage['limit'] : '';
	if (localStorage['query_string']){out+= '&'+localStorage['query_string']};
	return out
}
//http://xmlhttprequest.ru/
//http://learn.javascript.ru/json
function httpGet(request){
	var xmlhttp = new XMLHttpRequest()
	
	//xmlhttp.open("GET",request.url,true);
	xmlhttp.open("GET",request.url,true)
	xmlhttp.setRequestHeader('X-Redmine-API-Key', localStorage['apikey'])
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
			alertNotification("Can't connect to server.\nStatus: " + xmlhttp.statusText)
		}


	}
}